const bitcore = require('bitcore-lib-cash');
const fs = require('fs');
const got = require('got');

const args = process.argv.slice(2);
const path = args[0];
const txId = args[1];
const data = args[2];

if (
  typeof path !== 'string' ||
  path.slice(-5) !== '.json' ||
  typeof txId !== 'string' ||
  typeof data !== 'string' ||
  typeof args[3] !== 'undefined'
) {
  console.error(`
Usage: node ./create-tx.js path funding_txid data
If data is exactly '-', the <PAYMENT_DATA> will be omitted (marking a BitAuth identity).

E.g. node ./create-tx.js firstSet/private-myIdentity.json 84a279cc45aeb5989020851b4a63ce4b4be8fd515ecb47e2f65717e93245a859 -
`);
  process.exit(1);
}

const newPath = path.slice(0, -5) + '.transaction.json';
if (fs.existsSync(newPath)) {
  console.error(
    `
The file '${newPath}' already exists. Please move or delete it and try again.
`
  );
  process.exit(1);
}

const paymentData = data === '-' ? undefined : data;

let privateJson;
try {
  privateJson = require(`./${path}`);
} catch (e) {
  console.error(
    `
Couldn't parse identity information at: ${path}
Has the identity been created with './create-identity'?
`
  );
  process.exit(1);
}

const identity = privateJson.identityName;

const dustLimit = 546;
const fee = 400;

const createCashAccountScript = (accountName, paymentData) => {
  if (paymentData && paymentData.length > 75) {
    console.error(
      'Error: maximum currently-supported data length is 75 bytes.'
    );
    process.exit(1);
  }
  const nameBuffer = Buffer(accountName);
  const script = new bitcore.Script.fromString('6a0401010101').add(nameBuffer);
  if (paymentData) {
    const dataBuffer = Buffer(paymentData);
    return script.add(dataBuffer);
  }
  return script;
};

const createTransaction = (coin, coinIndex) => {
  if (coin.value < fee + 2 * dustLimit) {
    console.error(
      `Failed to create transaction: the coin is too small for each output to remain above the dust limit.`
    );
    process.exit(1);
  }
  const bitauthOutputsValue = coin.value - fee;
  const signingOutputValue = Math.floor(bitauthOutputsValue / 2);
  const identityValue = bitauthOutputsValue - signingOutputValue;

  const fundingScript = new bitcore.Script.fromAddress(
    privateJson.funding.address
  );

  const identityScript = new bitcore.Script.fromAddress(
    privateJson.identity.address
  );
  const signingScript = new bitcore.Script.fromAddress(
    privateJson.signing.address
  );
  const cashAccountScript = createCashAccountScript(identity, paymentData);

  const tx = bitcore.Transaction({
    version: 1,
    inputs: [
      {
        prevTxId: coin.mintTxid,
        outputIndex: coinIndex,
        sequenceNumber: 0x00000000,
        script: coin.script,
        output: {
          satoshis: coin.value,
          script: fundingScript
        }
      }
    ],
    outputs: [
      {
        satoshis: identityValue,
        script: identityScript
      },
      {
        satoshis: signingOutputValue,
        script: signingScript
      },
      {
        satoshis: 0,
        script: cashAccountScript
      }
    ],
    nLockTime: 0
  });

  tx.sign(bitcore.PrivateKey.fromWIF(privateJson.funding.wif));
  return tx;
};

(async () => {
  const coinsUrl = `https://api.bitcore.io/api/BCH/mainnet/tx/${txId}/coins`;
  try {
    const response = await got(coinsUrl);
    const coinsJSON = JSON.parse(response.body);
    const coinIndex = coinsJSON.outputs.findIndex(output =>
      privateJson.funding.address.includes(output.address)
    );
    const coin = coinsJSON.outputs[coinIndex];
    const tx = createTransaction(coin, coinIndex);
    const raw = tx.toBuffer().toString('hex');
    const result = {
      raw,
      tx
    };
    const resultJSON = JSON.stringify(result, undefined, 2);
    fs.writeFileSync(newPath, resultJSON);
    console.log(`BitAuth Cash Account/Identity created: ${newPath}`);
  } catch (error) {
    console.error(`
Error: ${error}
API request: ${coinsUrl}
`);
    process.exit(1);
  }
})();
