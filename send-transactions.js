const { directory, names } = require('./bulk-settings');
const rawTransactions = [];
names.forEach(name => {
  const transactionFile = require(`./${directory}/private-${name}.transaction.json`);
  rawTransactions.push(transactionFile.raw);
});

const command = 'sendrawtransaction';

console.log(
  `${command} ${rawTransactions.join(`
${command} `)}`
);
