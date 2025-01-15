// SPDX-License-Identifier: MIT
pragma solidity  ^0.8.17;

import "./zombiefeeding.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ZombieHelper is ZombieFeeding, ReentrancyGuard {

    uint levelUpFee = 0.001 ether; //the fee to level up a zombie


    modifier aboveLevel(uint _level, uint _zombieId) {
        require(zombies[_zombieId].level > _level); //make sure the zombie is above a certain level
        _;
    }

    function withdraw() external onlyOwner { //withdraw all funds from the contract
        address payable _owner = payable (owner()); //get the owner's address
        uint balance = address(this).balance; //protect against reentrancy by withdrawing all funds before calling the owner's address
        (bool success, ) = _owner.call{value: balance}(""); //send all the funds to the owner
        require(success, "Failed to send Ether"); //make sure the transfer was successful
    } 

    function setLevelUpFee(uint _fee) external onlyOwner {
        levelUpFee = _fee;
    }

    function levelUp(uint _zombieId) external payable { //level up a zombie
        require(msg.value == levelUpFee); //make sure the fee is paid
        zombies[_zombieId].level++; //increment the zombie's level
    }


    function changeName(uint _zombieId, string calldata _newName) external aboveLevel(2, _zombieId) onlyOwnerOf(_zombieId) {
        zombies[_zombieId].name = _newName; //change the name of the zombie
    }

    function changeDna(uint _zombieId, uint _newDna) external aboveLevel(20, _zombieId) onlyOwnerOf(_zombieId) {
        zombies[_zombieId].dna = _newDna; //change the DNA of the zombie
    }

    function getZombiesByOwner(address _owner) external view returns (uint[] memory) { //get all zombies owned by an address
        uint[] memory result = new uint[](ownerZombieCount[_owner]); //create an array to hold the zombie ids, and initialize it to the size of the owner's zombie count
        uint counter = 0; //create a counter to keep track of how many zombies we've added to the array
        for (uint i = 0; i < zombies.length; i++) { //loop through all zombies
            if (zombieToOwner[i] == _owner) { //if the zombie belongs to the owner, add it to the array
                result[counter] = i; //add the zombie id to the array
                counter++; //increment the counter
                }
        }
        return result; //return the array of zombie ids
    }
}