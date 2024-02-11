import { getDefaultApi, toKeyPair, postUncheckTransaction, chillOtherAndWatch } from './apis';
import { hexToU8a } from '@polkadot/util';
import { spawn, Thread, Worker } from 'threads';
import { ScanTask, toUncheckParam } from './types';
import { server } from './server';
import { MONITOR_URL, SCANNER_KEY, SUBSCRIBE_KEY, CHAIN_WS_URL, MODE } from './constant';

async function allWaitingValidators(api:any, chillCount: number): Promise<String[]> {
  let currentValidators = await api.query.session.validators();
  let currentValidatorsData = currentValidators.toString();
  console.log(currentValidatorsData);
  let validators = await api.query.staking.validators.entries();
  let validatorsData = validators.map((entry:any) => entry.map((data:any) => data.toHuman()));
  let max_chill = Math.min(chillCount, validatorsData.length);
  let waitringValidators :String[] = [];
  while (max_chill >= 0) {
    let waitingValidator = validatorsData[max_chill][0]?.toString();
    if (!currentValidatorsData.includes(waitingValidator??"")) {
      waitringValidators.push(waitingValidator??"");
    }
    max_chill--;
  }
  return waitringValidators
}

const test = async () => {
  let api = await getDefaultApi();
  let keyPair = toKeyPair(SCANNER_KEY);

  let validators = await allWaitingValidators(api, 500);
  console.log(validators);

  while (validators.length > 0) {
    let subvs = validators.splice(0, 20);
    let result = await chillOtherAndWatch(api, keyPair, subvs);
    console.log(result);
  }
  
  // for (let i = 0; i < validators.length; i++) {
  //   let result = await chillOtherAndWatch(api, keyPair, validators[i]);
  //   console.log(result);
  // }

  // let cid = 216;
  // let hash = '0x8aaed765012c15109812d050890209c40107fa5761f38c9de3c448a97a5e155e';
  // let hashU8 = hexToU8a(hash);
  // let tx: any = await api.query.channel.txMessages(cid, hashU8);
  // console.log(JSON.stringify(tx));
  // let params = toUncheckParam(tx, hashU8);
  // console.log(params.toString());
  // console.log(JSON.stringify(params));
  // let result = await postUncheckTransaction(params);
  // console.log(result);
};

const showConfig = () => {
  let subscribeAccount = toKeyPair(SUBSCRIBE_KEY);
  let scannerAccount = toKeyPair(SCANNER_KEY);
  console.log(
    `CHAIN_WS_URL: ${CHAIN_WS_URL} \n MONITOR_URL: ${MONITOR_URL} \n SCANNER: ${scannerAccount.address} \n SUBSCRIBER: ${subscribeAccount.address}`
  );
};

let main = async () => {
  // server();
  // showConfig();
  test();
  
  return;
  // subscribe thread
  if (MODE !== 'Aider') {
    const subscribe = await spawn(new Worker('./workers/subscribe'));
    await subscribe();
    console.log('finished subscribe');
    await Thread.terminate(subscribe);
    console.log('terminate subscribe');
  }
};

main().catch(console.error);
