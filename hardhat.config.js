require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // 引入 dotenv 以加载环境变量

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.28",
    networks: {
        sepolia: {
            url: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
            accounts: [`0x${process.env.PRIVATE_KEY}`]
        }
    },
    etherscan: {
        apiKey: "ACQNZXP6NXH9YXRE3VYC6J2VJ49WIPRWGU"
    }
};
