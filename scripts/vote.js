async function main() {
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

    const Vote = await hre.ethers.getContractFactory("Vote")
    const voteContract = await Vote.attach(contractAddress)

    const [owner, wallet2, wallet3] = await hre.ethers.getSigners()

    const pollId = await voteContract.createPoll("What is your favorite color?", ["Red", "Blue", "Green"])
}