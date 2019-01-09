const { directory, names } = require('./bulk-settings');

const sync = require('child_process').execSync;

console.log(`
Generating identities in ${directory} for names: ${names.join(', ')}
`);
names.forEach(name => {
  sync(`node ./create-identity ${name} ${directory}`, { stdio: 'inherit' });
});
