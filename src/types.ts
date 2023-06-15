export enum ChainType {
	RAW = 'Raw',
	FIL = 'Fil',
	BSC = 'Bsc',
	BTC = 'Btc',
	ETH = 'Eth',
	SOLANA = 'Solana',
	APTOS = 'Aptos'
}

export interface UncheckParams {
	cid: number;
	uid: Array<number>;
	msg: Array<number>;
	sig: Array<number>;
	hash: Array<number>;
	chain_type: string;
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
}

export interface RecordItem {
	timestamp: number;
	cid: number;
	uid: string;
	hash: string;
	blockNumber: number;
}

export const toUncheckParam = (tx: any, hash: Uint8Array): UncheckParams => {
	const uk: UncheckParams = {
		cid: parseInt(tx.cid.toString()),
		uid: Array.from(tx.txsource.uid),
		msg: Array.from(tx.msg),
		sig: Array.from(tx.signature),
		hash: Array.from(hash),
		chain_type: ChainType.ETH //ChainType[tx.txsource.chain_type.toNumber()]
	};
	return uk;
};
