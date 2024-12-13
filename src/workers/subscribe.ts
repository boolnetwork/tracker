import { ApiPromise } from '@polkadot/api';
import { RecordItem, toUncheckParam } from '../types';
import {
  getDefaultApi,
  isDroppedTransaction,
  postUncheckTransaction,
  toKeyPair,
  triggerAndWatch
} from '../apis';
import { expose } from 'threads/worker';
import { KeyringPair } from '@polkadot/keyring/types';
import { LATEST_BLOCK, SUBSCRIBE_KEY, DELAY_BLOCKS } from '../constant';

// 11 minute
const EXPIRED_TIME = 11 * 60 * 1000;

interface Context {
  beginHeight: number;
  currentHeight: number;
  state: Map<string, RecordItem>;
  capture: number;
  release: number;
  curious: number;
  keyPair: KeyringPair;
  isPendingLock: boolean;
  delayBlocks: number;
}

export const subscribeEvents = async () => {
  let api = await getDefaultApi();
  let state: Map<string, RecordItem> = new Map();
  let latestHeight: number = parseInt(LATEST_BLOCK);
  let delayBlocks: number = parseInt(DELAY_BLOCKS);
  if (latestHeight <= 10) {
    let latestHash = await api.rpc.chain.getFinalizedHead();
    let latestHeader = await api.rpc.chain.getHeader(latestHash);
    latestHeight = latestHeader.number.toNumber();
  }

  let context: Context = {
    beginHeight: latestHeight,
    currentHeight: latestHeight,
    state: state,
    capture: 0,
    release: 0,
    curious: 0,
    keyPair: toKeyPair(SUBSCRIBE_KEY),
    isPendingLock: false,
    delayBlocks: delayBlocks
  };

  console.log(`latestHeight : ${latestHeight}, operator: ${context.keyPair.address}`);

  // subscribe to finalized blocks:
  const ob = await api.rpc.chain.subscribeFinalizedHeads(async (header: any) => {
    // console.log(header);
    let latest = (await api.rpc.chain.getHeader(header.hash)).number.toNumber();

    if (!context.isPendingLock) {
      context.isPendingLock = true;
      try {
        await query(api, latest, context);
        context.beginHeight = latest;
      } catch (err) {
        console.log(err);
      }

      try {
        await check(api, context);
      } catch (err) {
        console.log(err);
      }

      context.isPendingLock = false;
    }
  });

  while (1) {
    console.log(
      `==bh: ${context.beginHeight}, ch: ${context.currentHeight}, dh: ${context.delayBlocks}, utx: ${context.state.size}, cp: ${context.capture}, re: ${context.release}, cu: ${context.curious}, lock: ${context.isPendingLock}==`
    );
    await sleep(10000);
  }
};

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// [begin, latest)
const query = async (api: ApiPromise, latest: number, context: Context): Promise<void> => {
  let beginHeight = context.beginHeight - context.delayBlocks;
  let endHeight = latest - context.delayBlocks;
  for (let i = beginHeight; i < endHeight; i++) {
    let blockHash = await api.rpc.chain.getBlockHash(i);
    let events = await api.query.system.events.at(blockHash);
    for (let record of events) {
      const { event } = record;
      if (event.method === 'SubmitTransaction' || event.method === 'SubmitTransactionSignResult') {
        let cid = event.data[0];
        let hash = event.data[3];
        let tx: any = await api.query.channel.txMessages(cid, hash);
        let params = toUncheckParam(tx, hash.toU8a());
        let result = await postUncheckTransaction(params);
        console.log('monitor :', result);
        if (context.state.delete(hash.toString())) {
          context.release++;
        }
      } else if (event.method === 'NewTransaction') {
        let key = event.data[3].toString();
        if (context.state.has(key)) {
          continue;
        }
        let record: RecordItem = {
          timestamp: new Date().getTime(),
          cid: parseInt(event.data[0].toString()),
          uid: event.data[1].toString(),
          hash: key,
          blockNumber: i
        };
        context.state.set(key, record);
        context.capture++;
      }
    }
    context.currentHeight = i;
  }
};

const check = async (api: ApiPromise, context: Context): Promise<void> => {
  if (context.state.size == 0) {
    return;
  }
  const now = new Date().getTime();

  let drop: string[] = [];
  context.state.forEach(async (item) => {
    if (isOutdate(now, item.timestamp)) {
      if (await isDroppedTransaction(api, item.cid, item.hash)) {
        context.curious++;
        console.log(`${context.keyPair.address} try repair [${item.cid}, ${item.hash}]`);
        let result = await triggerAndWatch(api, context.keyPair, item.cid, item.hash);
        console.log(`${context.keyPair.address} repair [${item.cid}, ${item.hash}], ${result}`);
      }
      drop.push(item.hash);
    }
  });

  drop.forEach((key) => {
    context.state.delete(key);
  });
};

const isOutdate = (now: number, target: number): boolean => {
  return now - target > EXPIRED_TIME;
};

expose(subscribeEvents);
