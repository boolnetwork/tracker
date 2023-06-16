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
import { SUBSCRIBE_KEY } from '../constant';

// 6 minute
const EXPIRED_TIME = 6 * 60 * 1000;

interface Context {
	latestHeight: number;
	state: Map<string, RecordItem>;
	capture: number;
	release: number;
	curious: number;
	keyPair: KeyringPair;
}

export const subscribeEvents = async () => {
	let api = await getDefaultApi();
	let state: Map<string, RecordItem> = new Map();
	let latestHeight: number = 0;
	if (latestHeight <= 10) {
		let latestHash = await api.rpc.chain.getFinalizedHead();
		let latestHeader = await api.rpc.chain.getHeader(latestHash);
		latestHeight = latestHeader.number.toNumber();
	}

	let context: Context = {
		latestHeight: latestHeight,
		state: state,
		capture: 0,
		release: 0,
		curious: 0,
		keyPair: toKeyPair(SUBSCRIBE_KEY)
	};

	console.log(`latestHeight : ${latestHeight}, operator: ${context.keyPair.address}`);
	// subscribe to finalized blocks:
	const ob = await api.rpc.chain.subscribeNewHeads(async (header: any) => {
		// console.log(header);
		let current = (await api.rpc.chain.getHeader(header.hash)).number.toNumber();
		try {
			await lookup(api, current, context);
			context.latestHeight = current;
		} catch (err) {
			console.log(err);
		}

		try {
			await check(api, context);
		} catch (err) {
			console.log(err);
		}
	});

	while (1) {
		console.log(
			`==height: ${context.latestHeight}, utx: ${context.state.size}, cp: ${context.capture}, re: ${context.release}, cu: ${context.curious}==`
		);
		await sleep(10000);
	}
};

async function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// (latest, current])
const lookup = async (api: ApiPromise, current: number, context: Context): Promise<void> => {
	for (let i = context.latestHeight; i < current; i++) {
		let hash = await api.rpc.chain.getBlockHash(i);
		let events = await api.query.system.events.at(hash);
		for (let record of events) {
			const { event } = record;
			if (event.method === 'SubmitTransaction') {
				let cid = event.data[0];
				let hash = event.data[3];
				let tx: any = await api.query.channel.txMessages(cid, hash);
				let params = toUncheckParam(tx, hash.toU8a());
				let result = await postUncheckTransaction(params);
				console.log('monitor :', result);
				context.state.delete(hash.toString());
				context.release++;
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
			if (!(await isDroppedTransaction(api, item.cid, item.hash))) {
				console.log(`unexpected item: ${item}`);
			} else {
				context.curious++;
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
