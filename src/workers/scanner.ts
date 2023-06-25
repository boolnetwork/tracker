import { ApiPromise } from '@polkadot/api';
import { expose } from 'threads/worker';
import { NeedSignedTransaction, ScanTask, TaskType, UncheckParams, toUncheckParam } from '../types';
import { getDefaultApi, isDroppedTransaction, postUncheckTransaction, toKeyPair, triggerAndWatch } from '../apis';
import { KeyringPair } from '@polkadot/keyring/types';
import crypto from 'crypto';
import { SCANNER_KEY } from '../constant';

function getHash(data: object): string {
	const hash = crypto.createHash('sha256');
	hash.update(JSON.stringify(data));
	return hash.digest('hex');
}

const scan = async (task: ScanTask) => {
	const tag = getHash(task);
	try {
		let keyPair = toKeyPair(SCANNER_KEY);
		console.log(`task >>> ${tag} begin with operator: ${keyPair.address}`);

		let api = await getDefaultApi();
		for (let i = task.from; i < task.to; i += task.step) {
			let iTo = Math.min(i + task.step, task.to);
			let result = await subScan(api, tag, i, iTo);
			await resend(api, tag, keyPair, task.type? task.type: TaskType.New, result);
		}
	} catch (err) {
		console.log(`task <<< ${tag} error: ${err}`);
	} finally {
		console.log(`task <<< ${tag} end`);
	}
};

// TODO to class
// export class Scanner {
//     tag: string,
//     api: ApiPromise,
// }

interface ScanResult {
	nsts: NeedSignedTransaction[],
	sbts: UncheckParams[],
}

let subScan = async (
	api: ApiPromise,
	tag: string,
	from: number,
	to: number,
): Promise<ScanResult> => {
	console.log(`${tag} scan [${from},${to}) blocks`);

	let nsts: NeedSignedTransaction[] = [];
	let sbts: UncheckParams[] = [];
	let set: Set<string> = new Set<string>();
	for (let i = from; i < to; i++) {
		let hash = await api.rpc.chain.getBlockHash(i);
		// console.log(`hash: ${hash}`);
		let events = await api.query.system.events.at(hash);
		for (let record of events) {
			const { event, phase } = record;
			if (event.method === 'NewTransaction') {
				let nst: NeedSignedTransaction = {
					cid: parseInt(event.data[0].toString()),
					epoch: parseInt(event.data[1].toString()),
					uid: event.data[2].toString(),
					hash: event.data[3].toString()
				};
				// filter duplicates
				if (set.has(nst.hash) == true) {
					continue;
				}
				set.add(nst.hash);

				let result = await isDroppedTransaction(api, nst.cid, nst.hash);
				if (result == true) {
					nsts.push(nst);
				}
			}

			if (event.method === 'SubmitTransaction') {
				let cid = event.data[0];
				let hash = event.data[3];
				let tx: any = await api.query.channel.txMessages(cid, hash);
				let params = toUncheckParam(tx, hash.toU8a());
				sbts.push(params);
			}
		}
	}
	const result: ScanResult = {
		nsts: nsts,
		sbts: sbts
	}
	console.log(`${tag} scan [${from},${to}) has ${nsts.length} dropped, ${sbts.length} submit`);
	return result;
};

let resend = async (
	api: ApiPromise,
	tag: string,
	keyPair: KeyringPair,
	taskType: TaskType,
	result: ScanResult,
) => {
	
	if (taskType == TaskType.New || taskType == TaskType.All) {
		console.log(`${tag} do New, ${result.nsts.length}`);
		for (const nst of result.nsts) {
			let result = await triggerAndWatch(api, keyPair, nst.cid, nst.hash);
			console.log(`${tag} ${result}`);
		}
	}
	
	if (taskType == TaskType.Submit || taskType == TaskType.All) {
		console.log(`${tag} do Submit, ${result.sbts.length}`);
		for (const para of result.sbts) {
			let result = await postUncheckTransaction(para);
			console.log(`${tag} ${result}`);
		}
	}
};

expose(scan);
