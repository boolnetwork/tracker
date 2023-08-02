# Tracker

bool system cross-chain transaction auxiliary tool, used to monitor outstanding transactions and trigger them.

## Env

```
# The URL of the listening chain
CHAIN_WS_URL=
# The URL of the notify
MONITOR_URL=
# The private key of the account used to submit the transaction for scaner task
SCANNER_KEY=
# The private key of the account used to submit the transaction for subscribe task
SUBSCRIBE_KEY=
# Specify from which block to start synchronizing data
LATEST_BLOCK=
# The number of delayed processing blocks can be regarded as the number of confirmed blocks
DELAY_BLOCKS=
```

## Example

- call scan

```
curl -H "Content-Type: application/json" -X POST -d '{"from": 4, "to": 5, "type": "Submit"}' http://localhost:3000/scan
```

- call repair

```
curl -H "Content-Type: application/json" -X POST -d '{"cid": 214, "hash": "0xf4b8b9ab5fd291fccac38e91859379615ab8ca03d4407844450dcac75c46f28f", "type": "Submit"}' http://localhost:3000/repair
```
