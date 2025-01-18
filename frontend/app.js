class ZombieGame {
    constructor() {
        this.web3 = null;
        this.contracts = {};
        this.account = null;
        this.init();
    }

    async init() {
        await this.initWeb3();
        this.bindEvents();
        // 先连接钱包后再初始化合约
        document.getElementById('connectWallet').addEventListener('click', () => this.connectWallet());
    }

    async initWeb3() {
        if (window.ethereum) {
            this.web3 = new Web3(window.ethereum);
            // 检查是否已连接
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                this.account = accounts[0];
                this.updateWalletStatus();
                await this.initContracts();
                this.updateUI();
            }

            // 监听账户变化
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    this.account = accounts[0];
                    this.updateWalletStatus();
                    this.updateUI();
                } else {
                    this.account = null;
                    this.updateWalletStatus();
                }
            });
        } else {
            console.log('Please install MetaMask!');
        }
    }

    async connectWallet() {
        try {
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            this.account = accounts[0];
            this.updateWalletStatus();
            
            // 连接成功后初始化合约
            await this.initContracts();
            this.updateUI();
        } catch (error) {
            console.error("Failed to connect wallet:", error);
            this.showError("Failed to connect wallet");
        }
    }

    updateWalletStatus() {
        const walletStatus = document.getElementById('walletStatus');
        const connectButton = document.getElementById('connectWallet');
        
        if (this.account) {
            walletStatus.textContent = `Connected: ${this.account.slice(0, 6)}...${this.account.slice(-4)}`;
            connectButton.textContent = 'Connected';
            connectButton.disabled = true;
        } else {
            walletStatus.textContent = 'Not connected';
            connectButton.textContent = 'Connect Wallet';
            connectButton.disabled = false;
        }
    }

    async initContracts() {
        try {
            // 使用部署的合约地址
            const contractAddress = '0x7A3E0DFf9B53fA0d3d1997903A48677399b22ce7'; // 替换为你的合约地址

            // 使用已经加载的 ABI
            this.contracts.ZombieOwnership = new this.web3.eth.Contract(
                window.CryptoZombiesABI,
                contractAddress
            );

            console.log("Contract initialized successfully");
            
            // 测试合约是否正确初始化
            const name = await this.contracts.ZombieOwnership.methods.name().call();
            console.log("Contract name:", name);
            
        } catch (error) {
            console.error("Failed to init contracts:", error);
            this.showError("Failed to initialize contracts");
        }
    }

    bindEvents() {
        document.getElementById('createZombieBtn').addEventListener('click', () => this.createZombie());
        document.getElementById('attackBtn').addEventListener('click', () => this.showAttackForm());
        document.getElementById('levelUpBtn').addEventListener('click', () => this.levelUp());
        document.getElementById('transferBtn').addEventListener('click', () => this.showTransferForm());
    }

    async createZombie() {
        if (!this.account) {
            this.showError("Please connect wallet first");
            return;
        }

        const name = document.getElementById('zombieName').value;
        if (!name) {
            this.showError("Please enter a zombie name");
            return;
        }

        try {
            const result = await this.contracts.ZombieOwnership.methods
                .createRandomZombie(name)
                .send({ from: this.account });
            
            console.log("Zombie created:", result);
            this.showSuccess(`Zombie "${name}" created successfully!`);
            await this.updateUI();
        } catch (error) {
            console.error("Failed to create zombie:", error);
            this.showError(error.message || "Failed to create zombie");
        }
    }

    async getMyZombies() {
        try {
            const zombieIds = await this.contracts.ZombieOwnership.methods
                .getZombiesByOwner(this.account)
                .call();
            
            return Promise.all(zombieIds.map(id => 
                this.contracts.ZombieOwnership.methods.zombies(id).call()
            ));
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    displayZombies(zombies) {
        const zombiesList = document.getElementById('zombiesList');
        zombiesList.innerHTML = zombies.map((zombie, index) => {
            // 将 DNA 转换为更易读的格式
            const dna = zombie.dna.toString().padStart(16, '0');
            
            return `
                <div class="zombie-card">
                    <h3>${zombie.name}</h3>
                    <div class="zombie-stats">
                        <div class="stat-item">
                            <div class="stat-label">Level</div>
                            <div class="stat-value">${zombie.level}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">DNA</div>
                            <div class="stat-value">${dna.slice(0, 4)}...${dna.slice(-4)}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Wins</div>
                            <div class="stat-value">${zombie.winCount}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Losses</div>
                            <div class="stat-value">${zombie.lossCount}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Ready Time</div>
                            <div class="stat-value">${new Date(zombie.readyTime * 1000).toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 其他功能方法...
    async attack(zombieId, targetId) {
        try {
            await this.contracts.ZombieOwnership.methods
                .attack(zombieId, targetId)
                .send({ from: this.account });
            this.updateUI();
        } catch (error) {
            this.showError("Attack failed");
        }
    }

    async transfer(zombieId, to) {
        try {
            await this.contracts.ZombieOwnership.methods
                .transferFrom(this.account, to, zombieId)
                .send({ from: this.account });
            this.updateUI();
        } catch (error) {
            this.showError("Transfer failed");
        }
    }

    showError(message) {
        const txStatus = document.getElementById('txStatus');
        txStatus.innerHTML = `Error: ${message}`;
        txStatus.style.color = 'red';
        // 3秒后清除错误消息
        setTimeout(() => {
            txStatus.innerHTML = '';
        }, 3000);
    }

    showSuccess(message) {
        const txStatus = document.getElementById('txStatus');
        txStatus.innerHTML = `Success: ${message}`;
        txStatus.style.color = 'green';
        // 3秒后清除成功消息
        setTimeout(() => {
            txStatus.innerHTML = '';
        }, 3000);
    }

    async updateUI() {
        try {
            const zombies = await this.getMyZombies();
            this.displayZombies(zombies);
        } catch (error) {
            console.error("Failed to update UI:", error);
            this.showError("Failed to load zombies");
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new ZombieGame();
});

