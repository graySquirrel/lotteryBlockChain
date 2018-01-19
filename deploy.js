const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');

const provider = new HDWalletProvider(
  // the metamask mnemonic
  'cross vendor ill output warfare lake alter couple cannon velvet vocal tomorrow',
  'https://rinkeby.infura.io/cK2Ws8LtUOL4DoU2ZKvK'
);
const web3 = new Web3(provider);
const INITIAL_STRING = 'Hi guys!';

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];
  console.log('Attempting to deploy from account', account);
  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ gas: '1000000', from: account});

  console.log('Contract deployed to ', result.options.address);
};
deploy();
