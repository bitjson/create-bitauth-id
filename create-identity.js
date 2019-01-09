const bitcore = require('bitcore-lib-cash');
const fs = require('fs');

const args = process.argv.slice(2);

const identityName = args[0];
const directory = args[1] || '.';

if (typeof identityName !== 'string' || typeof args[2] !== 'undefined') {
  console.error(`
Usage: node ./create-identity.js myIdentity [DIRECTORY]
Directory defaults to '.'

E.g.:
node ./create-identity.js myIdentity firstSet
`);
  process.exit(1);
}

const validIdentityRegexp = /^[a-zA-Z0-9_]{1,99}$/;
if (!identityName.match(validIdentityRegexp)) {
  console.error(`
The provided identity name: ${identityName}
is not valid. The identity must match the Regular Expression: ${validIdentityRegexp}
`);
  process.exit(1);
}

const fileName = `${directory}/private-${identityName}.json`;
if (fs.existsSync(fileName)) {
  console.error(
    `
The file '${fileName}' already exists. Please move or delete it and try again.
`
  );
  process.exit(1);
}

console.log(`
Initializing identity: ${identityName}`);

const date = new Date();
const fundingPrivateKey = new bitcore.PrivateKey();
const identityPrivateKey = new bitcore.PrivateKey();
const signingPrivateKey = new bitcore.PrivateKey();

const encodePrivateKey = privateKey => ({
  address: privateKey.toAddress().toCashAddress(),
  wif: privateKey.toWIF()
});

const funding = encodePrivateKey(fundingPrivateKey);
const identity = encodePrivateKey(identityPrivateKey);
const signing = encodePrivateKey(signingPrivateKey);

const identityFile = { identityName, date, funding, identity, signing };

fs.writeFileSync(fileName, JSON.stringify(identityFile, undefined, 2));
console.log(`Identity information saved to: ${fileName}
`);
