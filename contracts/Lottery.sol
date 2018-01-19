pragma solidity ^0.4.17;

contract Lottery {
    address public manager;
    address[] public players;
    uint[] public entryAmounts;
    uint MINIMUM_ETHER = .01 ether;

    function getPlayers() public view returns(address[]) {
        return players;
    }
    function getAmounts() public view returns(uint[]) {
        return entryAmounts;
    }
    function Lottery() public {
        manager = msg.sender;
    }

    function enter() public payable {
        require(msg.value > MINIMUM_ETHER);
        players.push(msg.sender);
        entryAmounts.push(msg.value);
    }

    function pickWinner() public onlyManagerCanCall {
        require(players.length > 0);

        uint indexOfPick = random() % players.length;
        address myPick = players[indexOfPick];
        myPick.transfer(this.balance);
        // reset contract state
        resetState();
    }

    function random() private view returns(uint) {
        return uint(keccak256(block.difficulty, now, players)); // bad rand
    }

    function resetState() private {
        players = new address[](0); // initial size 0
        entryAmounts = new uint[](0);
    }

    modifier onlyManagerCanCall() {
        require(msg.sender == manager);
        _;  // all the code from the calling fn goes here.
    }
}
