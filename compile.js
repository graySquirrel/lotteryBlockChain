const path = require('path');
const fs = require('fs');
const solc = require('solc');

const LotteryPath = path.resolve(__dirname,'contracts','Lottery.sol');
const source = fs.readFileSync(LotteryPath, 'utf8');

// all the npm install things had to do at command line powershell
// npm install --save solc
// npm install --save mocha ganache-cli web3@1.0.0-beta.26
// npm install --save truffle-hdwallet-provider

//console.log(solc.compile(source, 1));
// can see if powershell: node ./compile.js
module.exports = solc.compile(source, 1).contracts[':Lottery'];
