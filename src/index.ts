import { getDefaultApi, toKeyPair, postUncheckTransaction } from './apis';
import { hexToU8a } from '@polkadot/util';
import { spawn, Thread, Worker } from 'threads';
import { ScanTask, toUncheckParam } from './types';
import { server } from './server';

const test = async () => {
	let api = await getDefaultApi();
	let cid = 216;
	let hash = '0x8aaed765012c15109812d050890209c40107fa5761f38c9de3c448a97a5e155e';
	let hashU8 = hexToU8a(hash);
	let tx: any = await api.query.channel.txMessages(cid, hashU8);
	console.log(JSON.stringify(tx));
	let params = toUncheckParam(tx, hashU8);
	console.log(params.toString());
	console.log(JSON.stringify(params));
	let result = await postUncheckTransaction(params);
	console.log(result);
};

let main = async () => {
	server();

	// subscribe thread
	const subscribe = await spawn(new Worker('./workers/subscribe'));
	await subscribe();
	console.log('finished subscribe');
	await Thread.terminate(subscribe);
	console.log('terminate subscribe');
};

main().catch(console.error);
