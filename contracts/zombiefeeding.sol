// SPDX-License-Identifier: MIT
pragma solidity  ^0.8.17;

import "./zombiefactory.sol";

interface KittInterface { 
    function getKitty(uint256 _id) external view returns ( // Kitty struct

        bool isGestating,
        bool isReady,
        uint256 cooldownIndex,
        uint256 nextActionAt,
        uint256 siringWithId,
        uint256 birthTime,
        uint256 matronId,
        uint256 sireId,
        uint256 generation,
        uint256 genes  
    );
}

contract ZombieFeeding is ZombieFactory {

    KittInterface kittyContract; // Kitty contract interface

    modifier onlyOwnerOf(uint _zombieId) {
        require(msg.sender == zombieToOwner[_zombieId], "Sender is not the owner"); // check if sender is the owner
        _; // continue execution
    }

    function setKittyContractAddress(address _address) external onlyOwner{
        kittyContract = KittInterface(_address); // set Kitty contract address
    }

    function _triggerCooldown(Zombie storage _zombie) internal { 
        _zombie.readyTime = uint32(block.timestamp + cooldownTime); // set cooldown time
    }

    function _isReady(Zombie storage _zombie) internal view returns (bool) { 
        return (_zombie.readyTime <= block.timestamp); // check if cooldown time is over
    }


    function feedAndMultiply(uint _zombieId, uint _targetDna, string memory _species) internal onlyOwnerOf(_zombieId){
        Zombie storage myZombie = zombies[_zombieId]; // get Zombie struct
        require(_isReady(myZombie), "Zombie is not ready"); // check if Zombie is ready
        _targetDna = _targetDna % dnaModulus; // prevent overflow
        uint newDna = (myZombie.dna + _targetDna) / 2; // average DNA
        if(keccak256(abi.encodePacked(_species)) == keccak256(abi.encodePacked("kitty"))) {
            newDna = newDna - newDna % 100 + 99; // if species is "kitty", add 99 to DNA
        }
        _createZombie("Noname", newDna);
        _triggerCooldown(myZombie); // trigger cooldown
    }

    function feedOnKitty(uint _zombieId, uint _kittyId) public {
        uint kittyDna; // Kitty DNA
        (,,,,,,,,,kittyDna) = kittyContract.getKitty(_kittyId); // get Kitty DNA
        feedAndMultiply(_zombieId, kittyDna, "kitty"); // feed and multiply with Kitty DNA
    }

}