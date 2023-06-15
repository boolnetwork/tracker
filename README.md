# Tracker

bool system cross-chain transaction auxiliary tool, used to monitor outstanding transactions and trigger them.

## Example

* call scan
```
curl -H "Content-Type: application/json" -X POST -d '{"from": 4, "to": 5, "type": "Submit"}' http://localhost:3000/scan
```

* call repair
```
curl -H "Content-Type: application/json" -X POST -d '{"cid": 214, "hash": "0xf4b8b9ab5fd291fccac38e91859379615ab8ca03d4407844450dcac75c46f28f"}' http://localhost:3000/repair
```