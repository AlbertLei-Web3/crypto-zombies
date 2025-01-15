

// 定义智能合约地址
const contractAddress = "0xc9462425564EFd29008d061a42DEebA0Df0464A2";

// 初始化 Web3
let web3;
if (typeof window.ethereum !== "undefined") {
    web3 = new Web3(window.ethereum); // 使用 MetaMask
    console.log("MetaMask detected!");
} else {
    alert("MetaMask is not installed! Please install it to use this DApp.");
}

// 初始化合约
const cryptoZombies = new web3.eth.Contract(window.CryptoZombiesABI, "0xc9462425564EFd29008d061a42DEebA0Df0464A2");

console.log("Contract initialized!", cryptoZombies); 

// 获取当前账户
let userAccount;

window.ethereum.request({ method: "eth_requestAccounts" })
    .then(accounts => {
        userAccount = accounts[0];
        console.log("Connected account:", userAccount);
    })
    .catch(err => {
        console.error("Error connecting to MetaMask:", err);
    });

// 创建随机僵尸
function createRandomZombie(name) {
    return cryptoZombies.methods.createRandomZombie(name).send({ from: userAccount });
}

// 按钮绑定事件
document.getElementById("createZombie").addEventListener("click", () => {
    const zombieName = prompt("Enter a name for your Zombie:");
    if (zombieName) {
        createRandomZombie(zombieName)
            .then(() => {
                console.log("Zombie created successfully!");
                alert("Your Zombie is being created on the blockchain!");
            })
            .catch(err => {
                console.error("Error creating Zombie:", err);
                alert("Failed to create Zombie. See console for details.");
            });
    }
});
// 获取用户的僵尸列表
function getZombiesByOwner(owner) {
    return cryptoZombies.methods.getZombiesByOwner(owner).call();
}

// 显示僵尸列表
function displayZombies() {
    getZombiesByOwner(userAccount)
        .then(zombies => {
            const zombieList = document.getElementById("zombieList");
            zombieList.innerHTML = ""; // 清空列表
            zombies.forEach(zombieId => {
                // 获取僵尸详细信息（假设有 getZombieDetails 方法）
                cryptoZombies.methods.zombies(zombieId).call().then(zombie => {
                    const zombieItem = document.createElement("li");
                    zombieItem.textContent = `Name: ${zombie.name}, DNA: ${zombie.dna}`;
                    zombieList.appendChild(zombieItem);
                });
            });
        })
        .catch(err => {
            console.error("Error fetching zombies:", err);
        });
}

// 按钮绑定事件，更新僵尸列表
document.getElementById("refreshZombies").addEventListener("click", displayZombies);

