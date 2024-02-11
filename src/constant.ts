require('dotenv').config();

export const CHAIN_WS_URL = process.env.CHAIN_WS_URL || 'wss://test2-rpc-node-ws.bool.network';
export const MONITOR_URL = process.env.MONITOR_URL || 'http://127.0.0.1:8740';
export const SCANNER_KEY =
  process.env.SCANNER_KEY || '0x0000000000000000000000000000000000000000000000000000000000000001';
export const SUBSCRIBE_KEY =
  process.env.SUBSCRIBE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000001';

export const DELAY_BLOCKS = process.env.DELAY_BLOCKS || '0';
export const LATEST_BLOCK = process.env.LATEST_BLOCK || '0';
export const MODE = process.env.MODE || 'Full';

export const CustomType = {
  "ValidatorId": "AccountId",
  "Keys": {
    "babe": "AuthorityId",
    "gran": "AuthorityId",
    "im_online": "AuthorityId"
  },
  "AuthorityId": "[u8; 32]",
  "Address": "MultiAddress",
  "AccountId": "EthereumAccountId",
  "ExtrinsicSignature": "EthereumSignature",
  "LookupSource": "MultiAddress",
  "DIdentity": {
    "version": "u16",
    "pk": "Vec<u8>"
  },
  "Device": {
    "owner": "AccountId",
    "did": "DIdentity",
    "report": "Vec<u8>",
    "state": "DeviceState"
  },
  "DeviceState": {
    "_enum": [
      "Unmount",
      "Stop",
      "Standby",
      "Offline",
      "Serving",
      "TryExit"
    ]
  },
  "StakingState": {
    "user": "AccountId",
    "locked": "Balance",
    "start_time": "u64"
  },
  "OnChainEvent": {
    "_enum": {
      "OnChainPayload": "OnChainPayload"
    }
  },
  "OnChainPayload": {
    "did": "DIdentity",
    "proof": "Vec<u8>",
    "timestamp": "u64",
    "session": "BlockNumber",
    "signature": "Vec<u8>",
    "enclave": "Vec<u8>"
  },
  "ProviderId": "u32",
  "ProviderInfo": {
    "pid": "ProviderId",
    "owner": "AccountId",
    "devices": "Vec<DIdentity>",
    "cap_pledge": "Balance",
    "total_pledge": "Balance",
    "score": "u128",
    "rewards": "Balance",
    "punishment": "Balance",
    "staking_user_num": "u8",
    "status": "ProviderState"
  },
  "ProviderState": {
    "_enum": [
      "Stop",
      "Working"
    ]
  },
  "StakeInfo": {
    "locked": "Balance",
    "available_rewards": "Vec<(ProviderId, DIdentity, Balance)>"
  },
  "MessageOrigin": {
    "_enum": {
      "Pallet": "Vec<u8>",
      "Did": "DIdentity",
      "AccountId": "AccountId"
    }
  },
  "Message": {
    "sender": "MessageOrigin",
    "destination": "Vec<u8>",
    "payload": "Vec<u8>"
  },
  "CommitteeId": "u32",
  "CommitteeState": {
    "_enum": [
      "Creating",
      "Initializing",
      "Stop",
      "Working",
      "CreateFinished"
    ]
  },
  "ChannelState": {
    "_enum": [
      "Stop",
      "Working"
    ]
  },
  "HandleConnection": {
    "_enum": {
      "Cid": "CommitteeId",
      "CidWithAnchor": "(CommitteeId, u32, Vec<u8>)",
      "CommitteeParam": "(u16, u16, CryptoType, u8)"
    }
  },
  "CryptoType": {
    "_enum": [
      "Ecdsa",
      "Bls",
      "Schnorr",
      "Eddsa",
      "Starknet"
    ]
  },
  "Source": {
    "_enum": [
      "Mining",
      "Serving"
    ]
  },
  "Channel": {
    "channel_id": "u32",
    "creator": "AccountId",
    "info": "Vec<u8>",
    "cids": "Vec<(CommitteeId, u32)>",
    "state": "ChannelState"
  },
  "Parameters": {
    "t": "u16",
    "n": "u16"
  },
  "ExitParameters": {
    "_enum": {
      "Normal": "Vec<ProviderId>",
      "Force": "(CommitteeId, u8, Vec<u8>, Vec<u8>)"
    }
  },
  "OnChainPayloadVRF": {
    "cid": "CommitteeId",
    "epoch": "u32",
    "pk": "Vec<u8>",
    "proof": "Vec<u8>",
    "fork_id": "u8"
  },
  "Committee": {
    "cid": "CommitteeId",
    "creator": "AccountId",
    "epoch": "u32",
    "parameters": "Parameters",
    "pubkey": "Vec<u8>",
    "state": "CommitteeState",
    "crypto": "CryptoType",
    "fork": "u8",
    "channel_id": "u32",
    "chain_id": "u32",
    "anchor": "Vec<u8>",
    "times": "(BlockNumber, BlockNumber)"
  },
  "TxSource": {
    "chain_type": "u16",
    "uid": "Vec<u8>",
    "from": "Vec<u8>",
    "to": "Vec<u8>",
    "amount": "Vec<u8>"
  },
  "BlockNumber": "u32",
  "TxMessage": {
    "cid": "u32",
    "epoch": "u32",
    "sid": "u64",
    "msg": "Vec<u8>",
    "txsource": "TxSource",
    "signature": "Vec<u8>",
    "time_limit": "BlockNumber",
    "choose_index": "Vec<u16>",
    "status": "TxStatus"
  },
  "EpochChange": {
    "msg": "Vec<u8>",
    "signature": "Vec<u8>",
    "pubkey": "Vec<u8>"
  },
  "TxStatus": {
    "_enum": [
      "Unsigned",
      "Finished",
      "Abnormal",
      "Drop"
    ]
  },
  "BtcTxTunnel": {
    "_enum": [
      "Empty",
      "Verifying",
      "Open"
    ]
  },
  "ConfirmType": {
    "_enum": [
      "SourceHash",
      "TxData"
    ]
  },
  "DstChainType": {
    "_enum": [
      "Raw",
      "Fil",
      "Bsc",
      "BtcMainnet",
      "Eth",
      "BtcTestnet"
    ]
  },
  "SourceTXInfo": {
    "src_chain_id": "u32",
    "src_hash": "Vec<u8>"
  },
  "RandomNumberParams": {
    "consumer_addr": "Vec<u8>",
    "bls_info": "RandomNumSignInfo",
    "ecdsa_info": "RandomNumSignInfo",
    "number": "Vec<u8>",
    "status": "VrnStatus"
  },
  "RandomNumSignInfo": {
    "cid": "u32",
    "choose_index": "Vec<u16>",
    "sig": "Vec<u8>",
    "time_limit": "BlockNumber"
  },
  "VrnStatus": {
    "_enum": [
      "Unknown",
      "Stage1",
      "Stage2",
      "Finished",
      "Drop"
    ]
  }
}