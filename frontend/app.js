document.addEventListener('DOMContentLoaded', () => {
    const connectButton = document.getElementById('connectWallet');
    const walletStatus = document.getElementById('walletStatus');
    let currentAccount = null;

    // 检查是否安装了 MetaMask
    const checkIfWalletIsInstalled = () => {
        const { ethereum } = window;
        if (!ethereum) {
            alert('Please install MetaMask!');
            return false;
        }
        return true;
    };

    // 检查网络是否是 Sepolia
    const checkNetwork = async (chainId) => {
        const sepoliaChainId = '0xaa36a7'; // Sepolia 测试网的 chainId

        if (chainId !== sepoliaChainId) {
            try {
                // 尝试切换到 Sepolia 网络
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: sepoliaChainId }],
                });
            } catch (error) {
                // 如果网络不存在，添加网络
                if (error.code === 4902) {
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: sepoliaChainId,
                                chainName: 'Sepolia Test Network',
                                nativeCurrency: {
                                    name: 'Sepolia ETH',
                                    symbol: 'SEP',
                                    decimals: 18
                                },
                                rpcUrls: ['https://sepolia.infura.io/v3/'],
                                blockExplorerUrls: ['https://sepolia.etherscan.io/']
                            }]
                        });
                    } catch (addError) {
                        console.error(addError);
                    }
                }
                console.error(error);
            }
        }
    };

    // 连接钱包
    const connectWallet = async () => {
        try {
            if (!checkIfWalletIsInstalled()) return;

            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            currentAccount = accounts[0];
            walletStatus.textContent = `Connected: ${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`;
            connectButton.textContent = 'Connected';
            connectButton.disabled = true;

            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            await checkNetwork(chainId);

        } catch (error) {
            console.error(error);
            alert('Failed to connect wallet: ' + error.message);
        }
    };

    // 监听账户变化
    const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
            walletStatus.textContent = 'Please connect wallet';
            connectButton.textContent = 'Connect Wallet';
            connectButton.disabled = false;
            currentAccount = null;
        } else if (accounts[0] !== currentAccount) {
            currentAccount = accounts[0];
            walletStatus.textContent = `Connected: ${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`;
            connectButton.textContent = 'Connected';
            connectButton.disabled = true;
        }
    };

    // 监听链变化
    const handleChainChanged = (chainId) => {
        window.location.reload();
    };

    // 添加事件监听器
    if (window.ethereum) {
        connectButton.addEventListener('click', connectWallet);
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

        // 检查是否已经连接
        window.ethereum.request({ method: 'eth_accounts' })
            .then(handleAccountsChanged)
            .catch(console.error);
    }
});

