import { ApiPromise } from "@polkadot/api";
import { expose } from "threads/worker"
import { NeedSignedTransaction, ScanTask } from "../types";
import { getDefaultApi, isDroppedTransaction, toKeyPair, triggerAndWatch } from "../apis";
import { KeyringPair } from "@polkadot/keyring/types";
import crypto from "crypto";
import { SCANNER_KEY } from "../constant";

function getHash(data: object): string {
    const hash = crypto.createHash("sha256");
    hash.update(JSON.stringify(data));
    return hash.digest("hex");
}

const scan = async (task: ScanTask) => {
    const tag = getHash(task);
    try {
        console.log(`task >>> ${tag} begin`);
        let keyPair = toKeyPair(SCANNER_KEY);
        let api = await getDefaultApi();
        for (let i = task.from; i < task.to; i += task.step) {
            let iTo = Math.min(i + task.step, task.to);
            let txs = await subScan(api, tag, i, iTo);
            await resend(api, tag, keyPair, txs);
        }
    } catch (err) {
        console.log(`task <<< ${tag} error: ${err}`);
    } finally {
        console.log(`task <<< ${tag} end`);
    }
}

// TODO to class
// export class Scanner {
//     tag: string,
//     api: ApiPromise,
// }


let subScan = async (api: ApiPromise, tag: string, from: number, to: number): Promise<NeedSignedTransaction[]> => {
    console.log(`${tag} scan [${from},${to}) blocks`);

    let nsts: NeedSignedTransaction[] = [];
    let set: Set<string> = new Set<string>();
    for (let i = from; i < to; i++) {
        let hash = await api.rpc.chain.getBlockHash(i);
        // console.log(`hash: ${hash}`);
        let events = await api.query.system.events.at(hash);
        for (let record of events) {
            const { event, phase } = record;
            if (event.method === "NewTransaction") {
                let nst: NeedSignedTransaction = {
                    cid: parseInt(event.data[0].toString()),
                    epoch: parseInt(event.data[1].toString()),
                    uid: event.data[2].toString(),
                    hash: event.data[3].toString(),
                }
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
        }
    }
    console.log(`${tag} scan [${from},${to}) has ${nsts.length} dropped`);
    return nsts;
}

let resend = async (api: ApiPromise, tag: string, keyPair: KeyringPair, nsts: NeedSignedTransaction[]) => {
    for (const nst of nsts) {
        let result = await triggerAndWatch(api, keyPair, nst.cid, nst.hash);
        console.log(`${tag} ${result}`);
    }
}

expose(scan)
