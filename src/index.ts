import { getDefaultApi, isDroppedTransaction, toKeyPair, triggerAndWatch } from "./api"
import { ApiPromise } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";

interface NeedSignedTransaction {
    cid: number,
    epoch: number,
    uid: String,
    hash: String,
}

let main = async () => {
    let privateKey = "0xb7ad1bcb86dced081b9cca266d85fdcacd19da742be2f8537957e591e07eb5ea";
    let keyPair = toKeyPair(privateKey);
    let api = await getDefaultApi();

    // loop scan thread
    let txs: NeedSignedTransaction[] = await scan(api, 5103098, 5103099);
    await resend(api, keyPair, txs);

    // subscribe thread
    await subscribe(api);
}

let scan = async (api: ApiPromise, from: number, to: number): Promise<NeedSignedTransaction[]> => {
    console.log(`scan [${from},${to}) blocks`);

    let nsts: NeedSignedTransaction[] = [];
    let set: Set<String> = new Set<String>();
    for (let i = from; i < to; i++) {
        let hash = await api.rpc.chain.getBlockHash(i);
        console.log(`hash: ${hash}`);
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
    console.log(`scan [${from},${to}) has ${nsts.length} dropped`);
    return nsts;
}

let resend = async (api: ApiPromise, keyPair: KeyringPair, nsts: NeedSignedTransaction[]) => {
    for (const nst of nsts) {
        let result = await triggerAndWatch(api, keyPair, nst.cid, nst.hash);
        console.log(result);
    }
}

let subscribe = async (api: ApiPromise) => {
    // subscribe to finalized blocks:
	await api.rpc.chain.subscribeFinalizedHeads(async (header) => {
        let events = await api.query.system.events.at(header.hash);
        for (let record of events) {
            const { event, phase } = record;
            if (event.method === "NewTransaction") {
                let cid = event.data[0];
                let hash = event.data[3];
                let tx: any = await api.query.channel.txMessages(cid, hash);
                // TODO send to monitor
            }
        }
	});
}

main().catch(console.error).finally(() => process.exit());