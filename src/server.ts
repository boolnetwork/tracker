import express from 'express';
import { spawn, Thread, Worker } from 'threads';
import { ScanTask, toUncheckParam } from './types';
import { SCANNER_KEY } from './constant';
import { getDefaultApi, postUncheckTransaction, toKeyPair, triggerAndWatch } from './apis';
import { hexToU8a } from '@polkadot/util';

enum TaskType {
	New = 'New',
	Submit = 'Submit',
	All = 'All'
}

interface RequestScanTask {
	from: number;
	to: number;
	type: TaskType;
}

interface RequestRepair {
	cid: number;
	hash: string;
	type: TaskType;
}

const app = express();
app.use(express.json());

app.post('/scan', async (req, res) => {
	const scan = await spawn(new Worker('./workers/scanner'));
	const task: ScanTask = {
		reason: 'client request',
		from: req.body.from,
		to: req.body.to,
		step: 200
	};
	scan(task).then(async () => await Thread.terminate(scan));

	res.status(200).send('Ok');
});

app.post('/repair', async (req, res) => {
	let api = await getDefaultApi();
	// TODO check parameters
	let cid = req.body.cid;
	let hash = req.body.hash;
	try {
		if (req.body.type == 'New') {
			let keypair = toKeyPair(SCANNER_KEY);
			await triggerAndWatch(api, keypair, cid, hash).then((v) => {
				res.status(200).send(v);
			});
		} else if ((req.body.type = 'Submit')) {
			let tx: any = await api.query.channel.txMessages(cid, hash);
			let params = toUncheckParam(tx, hexToU8a(hash));
			await postUncheckTransaction(params).then((v) => {
				res.status(200).send(v);
			});
		} else {
			res.status(403).send('Unknown Type');
		}
	} catch (e) {
		res.status(403).send(e);
	}
});

export const server = () => {
	const port = 3000;
	app.listen(port, () => {
		console.log(`Server running at http://localhost:${port}`);
	});
};
