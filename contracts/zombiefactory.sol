// SPDX-License-Identifier: MIT
pragma solidity  ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ZombieFactory is Ownable {
    event NewZombie(uint zombieId, string name, uint dna);

    uint dnaDigits = 16;
    uint dnaModulus = 10 ** dnaDigits;
    uint cooldownTime = 1 days; //1 day in seconds

    
    struct Zombie {
        string name;
        uint dna;
        uint32 level;
        uint32 readyTime;
        uint16 winCount;
        uint16 lossCount;
    }

    Zombie[] public zombies;

    mapping(uint => address) public zombieToOwner; //zombieId => owner address
    mapping(address => uint) ownerZombieCount; //owner address => zombie count


    function _createZombie(string memory _name, uint _dna) internal { 
        
        zombies.push(Zombie(_name, _dna, 1, uint32(block.timestamp + cooldownTime), 0, 0)); //add a new zombie to the array
        uint id = zombies.length - 1; //get the index of the newly added zombie
        zombieToOwner[id] = msg.sender; //set the owner of this zombie to be the sender
        ownerZombieCount[msg.sender]++; //increment the zombie count of this owner
        emit NewZombie(id, _name, _dna); //emit the event
    }

    function _generateRandomDna(string memory _str) private view returns (uint) { //_str is used to seed the random number generator
        uint rand = uint(keccak256(abi.encodePacked(_str))); //keccak256 is a cryptographic hash function, abi.encodePacked concatenates all the parameters into one string
        return rand % dnaModulus; //modulo operation to ensure the DNA is within the range of 0 to (10^dnaDigits - 1)
    }

    function createRandomZombie(string memory _name) public { //public function to create a random zombie
        require(bytes(_name).length > 0); //check if the name is not empty
        require(ownerZombieCount[msg.sender] == 0); //check if the sender has no zombies yet
        uint randDna = _generateRandomDna(_name); //generate a random DNA
        _createZombie(_name, randDna); //create the zombie with the random DNA
    }
}
