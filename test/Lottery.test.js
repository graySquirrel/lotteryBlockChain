const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3'); //caps because its a constructor

// make an instance
// ganache is the network to connect the instance to
const provider = ganache.provider();
const web3 = new Web3(provider);

// get the compiled contract interface (ABI) and bytecode
const { interface, bytecode } = require('../compile');

let accounts;
let lottery;
beforeEach(async () => {
  // Get a list of all accounts
  accounts = await web3.eth.getAccounts();
  //console.log(accounts);
  // Use one of the accounts to deploy the contract
  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: '1000000' });
  lottery.setProvider(provider);
});

describe('Lottery', () => {
  it('deploys a contract', () => {
    assert.ok(lottery.options.address);
    //console.log(lottery.options.address);
  });
  it('add a player', async () => {
    const weiToWager = web3.utils.toWei('1', 'ether');
    await lottery.methods.enter().send(
      {from: accounts[1],
        gas: '1000000',
        value: weiToWager}
    );
    var players = await lottery.methods.getPlayers().call({
      from: accounts[0]});
    var amounts = await lottery.methods.getAmounts().call({
      from: accounts[0]});
    // always value should be first, value it is second.
    assert.equal(1, players.length);
    assert.equal(1, amounts.length);
    assert.equal(accounts[1], players[0]);
    assert.equal(weiToWager, amounts[0]);
    //console.log(lottery.options.address);
  });

  it('add multiple players', async () => {
    const weiToWager = web3.utils.toWei('1', 'ether');
    await lottery.methods.enter().send(
      {from: accounts[0], gas: '1000000', value: weiToWager});
    await lottery.methods.enter().send(
      {from: accounts[1], gas: '1000000', value: weiToWager});
    await lottery.methods.enter().send(
      {from: accounts[2], gas: '1000000', value: weiToWager});
    var players = await lottery.methods.getPlayers().call({
      from: accounts[0]});
    var amounts = await lottery.methods.getAmounts().call({
      from: accounts[0]});
    // always value should be first, value it is second.
    assert.equal(3, players.length);
    assert.equal(3, amounts.length);
    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
    assert.equal(weiToWager, amounts[0]);
    assert.equal(weiToWager, amounts[1]);
    assert.equal(weiToWager, amounts[2]);
    //console.log(lottery.options.address);
  });

  it('fail entry due to not enough ether', async () => {
    const weiToWager = web3.utils.toWei('0.01', 'ether');
    try {
      await lottery.methods.enter().send({
        from: accounts[0], gas: '1000000', value: weiToWager
      });
      assert(false);
    } catch (err) {
      assert(err);
      //console.log(err);
    }
  });

  it('fail if pickWinner called by other than manager', async () => {
    try { // manager is accounts[0]
      await lottery.methods.pickWinner().send({
        from: accounts[1]
      });
      assert(false);
    } catch (err) {
      assert(err);
      //console.log(err);
    }
  });

  it('fail if pickWinner called with no players', async () => {
    try { // manager is accounts[0]
      await lottery.methods.pickWinner().send({
        from: accounts[0]
      });
      assert(false);
    } catch (err) {
      assert(err);
      //console.log(err);
    }
  });

  it('send money to winner and reset state', async () => {
    const weiToWager = web3.utils.toWei('1', 'ether');
    await lottery.methods.enter().send(
      {from: accounts[1],
        gas: '1000000',
        value: weiToWager}
    );

    const initialBalance = await web3.eth.getBalance(accounts[1]);
    await lottery.methods.pickWinner().send({from: accounts[0]});
    const afterBalance = await web3.eth.getBalance(accounts[1]);
    const difference = afterBalance - initialBalance;
    //console.log(difference);
    assert.equal(weiToWager, difference);
    var players = await lottery.methods.getPlayers().call();
    var amounts = await lottery.methods.getAmounts().call();
    assert.equal(0, players.length);
    assert.equal(0, amounts.length);
    var leftovers = await web3.eth.getBalance(lottery.options.address);
    assert.equal(0, leftovers);
  });

});
