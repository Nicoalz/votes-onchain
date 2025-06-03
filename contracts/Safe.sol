pragma solidity ^0.8.28;

contract Safe {

  address public owner;
  mapping(address => uint) public balances;

  constructor() {
    owner = msg.sender;
  }

  function sendMoney() public payable {
    require(msg.value >= 0.1 ether, "You need to send at least 0.1 ether");
    balances[msg.sender] += msg.value;
  }

  function seeBalance() public view returns (uint) {
    return balances[msg.sender];
  }


  function sendBalanceMoneyTo(address _address) public {
    require(msg.sender == owner, "You are not the owner");
    require(balances[msg.sender] >= 0.1 ether, "Insufficient balance");
    balances[msg.sender] -= 0.1 ether;
    balances[_address] += 0.1 ether;
  }

  function seeBalanceOfWallet(address _address) public view returns (uint) {
    return balances[_address];
  }

  function withdraw(uint amount) public payable {
    require(msg.sender == owner, "You are not the owner");
    require(balances[msg.sender] >= amount, "Insufficient balance");
    balances[msg.sender] -= amount;
    payable(msg.sender).transfer(amount);
  }

  function withDrawAll() public {
    require(msg.sender == owner, "You are not the owner");
    payable(msg.sender).transfer(address(this).balance);
  }

  function viewBalance() public view returns (uint) {
    return address(this).balance;
  }

  function sendBalanceToAll(address[] memory addresses) public {
    require(msg.sender == owner, "Only owner can distribute all balances");
    for(uint i = 0; i < addresses.length; i++) {
      address recipient = addresses[i];
      uint amount = balances[recipient];
      if(amount > 0) {
        balances[recipient] = 0;
        payable(recipient).transfer(amount);
      }
    }
  }
}