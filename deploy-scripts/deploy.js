async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // 部署合约
    const ZombieOwnership = await ethers.getContractFactory("ZombieOwnership");
    const zombieOwnership = await ZombieOwnership.deploy();

    console.log("Waiting for the contract to be mined...");
    await zombieOwnership.waitForDeployment(); // 使用 waitForDeployment 替代 deployed()

    console.log("ZombieOwnership deployed to:", await zombieOwnership.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

    //ethersV6，版本问题会导致deployd()方法失效，使用waitForDeployment()方法代替！！！！！！！！！！！！
