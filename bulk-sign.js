// generate a bunch of identities and outputs
// const generateMode = true;
const { directory, names, fundingTx, data } = require('./bulk-settings');
const sync = require('child_process').execSync;
console.log(`
Creating transactions in ${directory} for names: ${names.join(', ')}
`);
names.forEach(name => {
  sync(
    `node ./create-tx ${directory}/private-${name}.json ${fundingTx} ${data}`,
    {
      stdio: 'inherit'
    }
  );
});
