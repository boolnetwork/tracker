// @ts-nocheck

import { ApiPromise, WsProvider } from '@polkadot/api';
import { CustomType, CHAIN_WS_URL } from '../constant';
import { KeyringPair } from '@polkadot/keyring/types';
import { createTestKeyring } from '@polkadot/keyring';
import { hexToU8a } from '@polkadot/util';

let api: any = undefined;
export const getDefaultApi = async (): Promise<ApiPromise> => {
  if (api == undefined) {
    const wsProvider = new WsProvider(CHAIN_WS_URL);
    const options = {
      // types: CustomType,
      provider: wsProvider
    };
    api = await ApiPromise.create(options);
  }
  return api;
};

export const toKeyPair = (privateKey: String): KeyringPair => {
  const keyring = createTestKeyring();
  const keyPair = keyring.addFromSeed(hexToU8a(privateKey), undefined, 'ethereum');
  return keyPair;
};

export const isDroppedTransaction = async (
  api: ApiPromise,
  cid: number,
  hash: String
): Promise<boolean> => {
  let tx: any = await api.query.channel.txMessages(cid, hash);
  // Drop type is 3
  return tx.status.toNumber() === 3;
};

export const triggerAndWatch = async (
  api: ApiPromise,
  keyPair: KeyringPair,
  cid: number,
  hash: String
): Promise<String> => {
  let doWithListener = (seed: any, call: any) => {
    return new Promise(function (resolve, reject) {
      call
        .signAndSend(seed, (cb: any) => {
          if (cb.status.isInBlock) {
            let result = '';
            cb.events.forEach(({ phase, event: { data, method, section } }) => {
              result += '\t' + phase.toString() + `: ${section}.${method}` + data.toString();
            });
            resolve(result);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  let call = api.tx.channel.requestSign(cid, hash);
  let result = await doWithListener(keyPair, call);
  return result;
};

export const chillOtherAndWatch = async (
  api: ApiPromise,
  keyPair: KeyringPair,
  controllers: String[]
): Promise<String> => {
  let doWithListener = (seed: any, call: any) => {
    return new Promise(function (resolve, reject) {
      call
        .signAndSend(seed, (cb: any) => {
          if (cb.status.isInBlock) {
            let result = '';
            cb.events.forEach(({ phase, event: { data, method, section } }) => {
              result += '\t' + phase.toString() + `: ${section}.${method}` + data.toString();
            });
            resolve(result);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  let txs = [];
  controllers.forEach((controller) => {
      txs.push(api.tx.staking.chillOther(controller))
  });
  let call = api.tx.utility.batch(txs);
  let result = await doWithListener(keyPair, call);
  return result;
};