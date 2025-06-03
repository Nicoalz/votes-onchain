async function main() {
	const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

	const Safe = await hre.ethers.getContractFactory("Safe")
	const safeAdress = await Safe.attach(contractAddress)

	const [owner, wallet2, wallet3] = await hre.ethers.getSigners()

	// Vérification des soldes ETH natifs
	const ownerNativeBalance = await hre.ethers.provider.getBalance(owner.address)
	const wallet2NativeBalance = await hre.ethers.provider.getBalance(wallet2.address)
	const wallet3NativeBalance = await hre.ethers.provider.getBalance(wallet3.address)

	console.log("Native ETH Balances:")
	console.log("Owner Native Balance: ", owner.address, hre.ethers.formatEther(ownerNativeBalance), "ETH")
	console.log("Wallet2 Native Balance: ", wallet2.address, hre.ethers.formatEther(wallet2NativeBalance), "ETH")
	console.log("Wallet3 Native Balance: ", wallet3.address, hre.ethers.formatEther(wallet3NativeBalance), "ETH")
	console.log("----------------------------------------")

	const safeBalanceBefore = await safeAdress.viewBalance()

	console.log("Safe Balance before owner send money: ", hre.ethers.formatEther(safeBalanceBefore))

	const tx = await safeAdress.connect(owner).sendMoney({
		value: hre.ethers.parseEther("0.1"),
	})
	await tx.wait()

	const safeBalance = await safeAdress.viewBalance()

	console.log("Safe Balance after owner send money: ", hre.ethers.formatEther(safeBalance))

	const walletOwnerBalance = await safeAdress.seeBalanceOfWallet(owner.address)

	console.log("Wallet Owner Balance: ", hre.ethers.formatEther(walletOwnerBalance))

	await safeAdress.connect(owner).sendBalanceMoneyTo(wallet2.address)

	const balance2 = await safeAdress.seeBalanceOfWallet(wallet2.address)

	console.log("Balance2: ", hre.ethers.formatEther(balance2))

	const addresses = [owner.address, wallet2.address, wallet3.address];
	await safeAdress.connect(owner).sendBalanceToAll(addresses);

	const safeBalanceAfter = await safeAdress.viewBalance()

	console.log("Safe Balance after sending all balances: ", hre.ethers.formatEther(safeBalanceAfter))
  
}

main()