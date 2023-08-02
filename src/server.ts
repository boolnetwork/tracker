import express from 'express';
import { spawn, Thread, Worker } from 'threads';
import { ScanTask, TaskType, toUncheckParam } from './types';
import { SCANNER_KEY } from './constant';
import { getDefaultApi, postUncheckTransaction, toKeyPair, triggerAndWatch } from './apis';
import { hexToU8a } from '@polkadot/util';

const app = express();
app.use(express.json());

app.post('/scan', async (req, res) => {
  const scan = await spawn(new Worker('./workers/scanner'));
  let taskType = TaskType.New;
  if (req.body.type == 'New') {
    taskType = TaskType.New;
  } else if (req.body.type == 'Submit') {
    taskType = TaskType.Submit;
  } else if (req.body.type == 'All') {
    taskType = TaskType.All;
  } else {
    taskType = TaskType.New;
  }

  try {
    const task: ScanTask = {
      reason: 'client request',
      from: req.body.from,
      to: req.body.to,
      step: 200,
      type: taskType
    };
    scan(task).then(async () => await Thread.terminate(scan));
  } catch (e) {
    res.status(403).send(e);
  }

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
    console.log(`Server running at ${port}`);
  });
};
