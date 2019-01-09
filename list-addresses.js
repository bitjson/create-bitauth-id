const { directory, names } = require('./bulk-settings');
const map = {};
names.forEach(name => {
  const identityFile = require(`./${directory}/private-${name}.json`);
  map[name] = identityFile.funding.address;
});
console.log(map);
for (const name in map) {
  console.log(`${name}:
${map[name]}`);
}
