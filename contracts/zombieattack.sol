// SPDX-License-Identifier: MIT
pragma solidity  ^0.8.17;

import "./zombiehelper.sol";

contract ZombieAttack is ZombieHelper {
    uint randNonce = 0; // used to generate random numbers in the range 1-100
    uint attackVictory = 70; // chance of winning the attack

    function randMod(uint _modulus) internal returns (uint) { // generates a pseudo-random number in the range 1-100
        randNonce++; // increment nonce
        return uint(keccak256(abi.encodePacked(
            block.timestamp,
            msg.sender, 
            blockhash(block.number - 1), 
            block.prevrandao,
            randNonce
            ))) % _modulus; // return the pseudo-random number in the range 1-100
    }

    function attack(uint _zombieId, uint _targetId) external onlyOwnerOf(_zombieId) { // attack a zombie
        Zombie storage myZombie = zombies[_zombieId]; // get the zombie to attack
        Zombie storage enemyZombie = zombies[_targetId]; // get the target zombie
        uint rand = randMod(100); // generate a pseudo-random number in the range 1-100
        if (rand <= attackVictory) {
            myZombie.winCount++; // increment the win count of the zombie
            myZombie.level++; // increment the level of the zombie
            enemyZombie.lossCount++; // increment the loss count of the target zombie
            feedAndMultiply(_zombieId, enemyZombie.dna, "zombie"); // feed and multiply the zombie
        } else {
            myZombie.lossCount++; // increment the loss count of the zombie
            enemyZombie.winCount++; // increment the win count of the target zombie
        }
        _triggerCooldown(myZombie); // whatever happens, trigger the cooldown
    }
}