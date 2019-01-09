# Create BitAuth Cash Account/Identity

Replace items in `[]` with your info, respectively.

```sh
node ./create-identity.js [yourIdentityName]
# fund the "funding" address, then:
node ./create-tx.js [yourIdentityName] [INPUT_TXID] -
# It's also possible to include payment data by replacing the '-':
# node ./create-tx.js [yourIdentityName] [INPUT_TXID] [yourPaymentData]
```

For bulk generation, update `bulk-settings.js` and then:

```sh
node ./bulk-generate.js
node ./list-addresses.js
# fund all the "funding" addresses in the same transaction
# update the txid of the funding transaction in `bulk-settings`, then:
node ./bulk-sign.js
node ./send-transactions.js
```
