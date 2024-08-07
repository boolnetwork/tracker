export enum ChainType {
  RAW = 'Raw',
  FIL = 'Fil',
  BSC = 'Bsc',
  BTC = 'Btc',
  ETH = 'Eth',
  SOLANA = 'Solana',
  APTOS = 'Aptos',
  STARKNET = 'Starknet',
  SUI = 'Sui',
  SUBSTRATE = 'Substrate',
  TON = 'Ton',
  NEAR = 'Near',
  TRON = 'Tron',
  CKB = "Ckb"
}

export interface UncheckParams {
  cid: number;
  uid: Array<number>;
  msg: Array<number>;
  sig: Array<number>;
  hash: Array<number>;
  chain_type: string;
  source_hash: Array<number>;
}

export interface NeedSignedTransaction {
  cid: number;
  epoch: number;
  uid: string;
  hash: string;
}

export interface ScanTask {
  reason: string;
  from: number;
  to: number;
  step: number;
  type?: TaskType;
  cids?: Array<number>;
}

export interface RecordItem {
  timestamp: number;
  cid: number;
  uid: string;
  hash: string;
  blockNumber: number;
}

export enum TaskType {
  New = 'New',
  Submit = 'Submit',
  All = 'All'
}

export interface RequestScanTask {
  from: number;
  to: number;
  type: TaskType;
}

export interface RequestRepair {
  cid: number;
  hash: string;
  type: TaskType;
}

const toChainType = (type: number): ChainType => {
  if (type == 4) {
    return ChainType.ETH;
  } else if (type == 1) {
    return ChainType.FIL;
  } else if (type == 2) {
    return ChainType.BSC;
  } else if (type == 3) {
    return ChainType.BTC;
  } else if (type == 5) {
    return ChainType.SOLANA;
  } else if (type == 6) {
    return ChainType.APTOS;
  } else if (type == 7) {
    return ChainType.STARKNET;
  } else if (type == 8) {
    return ChainType.SUI;
  } else if (type == 9) {
    return ChainType.SUBSTRATE;
  } else if (type == 10) {
    return ChainType.TON;
  } else if (type == 11) {
    return ChainType.NEAR;
  } else if (type == 12) {
    return ChainType.TRON;
  } else if (type == 13) {
    return ChainType.CKB;
  }else {
    return ChainType.RAW;
  }
};

export const toUncheckParam = (tx: any, hash: Uint8Array): UncheckParams => {
  const uk: UncheckParams = {
    cid: parseInt(tx.cid.toString()),
    uid: Array.from(tx.txsource.uid),
    msg: Array.from(tx.msg),
    sig: Array.from(tx.signature),
    hash: Array.from(hash),
    chain_type: toChainType(tx.txsource.chainType.toNumber()),
    source_hash: Array.from([0])
  };
  return uk;
};
