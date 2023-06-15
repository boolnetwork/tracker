import { getDefaultApi, toKeyPair, postUncheckTransaction } from "./apis"
import { hexToU8a } from "@polkadot/util";
import { spawn, Thread, Worker } from "threads"
import { ScanTask, toUncheckParam } from "./types";
import { subscribe } from "diagnostics_channel";
import { subscribeEvents } from "./workers/subscribe";

// TODO add express server

let main = async () => {
    // let api = await getDefaultApi();
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
    // loop scan thread
    // let txs: NeedSignedTransaction[] = await scan(api, 5103098, 5103099);
    // await resend(api, keyPair, txs);


    // const scan = await spawn(new Worker("./workers/scanner"));
    // const task: ScanTask = {
    //     reason: 'local test',
    //     from: 5103007,
    //     to: 5103217,
    //     step: 200,
    // }
    // await scan(task);
    // await Thread.terminate(scan)


    // subscribe thread
    const subscribe = await spawn(new Worker("./workers/cache"));
    await subscribe();
    console.log('finished subscribe');
    await Thread.terminate(subscribe)
    console.log('terminate subscribe');

}


main().catch(console.error)