const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Vote", function () {
	let voteContract
	let owner
	let wallet2
	let wallet3

	beforeEach(async function () {
		;[owner, wallet2, wallet3] = await ethers.getSigners()
		const Vote = await ethers.getContractFactory("Vote")
		voteContract = await Vote.deploy()
		await voteContract.waitForDeployment()
	})

	it("Should create a poll only if owner", async function () {
		// Try to create a poll with non-owner wallet
		await expect(voteContract.connect(wallet2).createPoll("What is your favorite color?", "Red", "Blue", 1)).to.be.revertedWith("You are not the owner")

		// Verify owner can create a poll
		await expect(voteContract.connect(owner).createPoll("What is your favorite color?", "Red", "Blue", 1)).to.not.be.reverted
	})

	it("Should not vote for a poll if not active", async function () {
		await voteContract.connect(owner).createPoll("What is your favorite color?", "Red", "Blue", 1)

		await expect(voteContract.connect(wallet2).vote(0, true)).to.not.be.reverted
		await expect(voteContract.connect(wallet3).vote(0, false)).to.be.revertedWith("Poll is not active")
	})

	it("Should not vote for a poll if you have already voted", async function () {
		await voteContract.connect(owner).createPoll("What is your favorite color?", "Red", "Blue", 2)
		await voteContract.connect(wallet2).vote(0, true)
		await expect(voteContract.connect(wallet2).vote(0, true)).to.be.revertedWith("You have already voted")
	})

	it("Should create a poll with correct data", async function () {
		await voteContract.connect(owner).createPoll("What is your favorite color?", "Red", "Blue", 3)

		const [question, option1, option2, votes1, votes2, isActive, maxVotes] = await voteContract.getPoll(0)

		// Question should match
		expect(question).to.equal("What is your favorite color?")

		// Options array should match
		expect(option1).to.equal("Red")
		expect(option2).to.equal("Blue")

		// Votes array should match
		expect(votes1.length).to.equal(0)
		expect(votes2.length).to.equal(0)

		// isActive should be true
		expect(isActive).to.equal(true)

		// maxVotes should be 3
		expect(maxVotes).to.equal(3)
	})

	it("Should vote for a poll", async function () {
		await voteContract.connect(owner).createPoll("What is your favorite color?", "Red", "Blue", 2)

		await voteContract.connect(wallet2).vote(0, true)

		const [question, option1, option2, votes1, votes2, isActive, maxVotes] = await voteContract.getPoll(0)

		expect(votes1[0]).to.equal(wallet2.address)
		expect(votes2.length).to.equal(0)
	})

	it("Should get all polls", async function () {
		await voteContract.connect(owner).createPoll("What is your favorite color?", "Red", "Blue", 5)
		await voteContract.connect(owner).createPoll("What is your favorite animal?", "Dog", "Cat", 5)
		// const [questions, options1, options2, votes1, votes2, isActive] = await voteContract.getAllPolls()

		// vote for first poll
		await voteContract.connect(wallet2).vote(0, true)
		await voteContract.connect(wallet3).vote(0, false)
		// vote for second poll
		await voteContract.connect(wallet2).vote(1, true)
		await voteContract.connect(wallet3).vote(1, true)

		const [questions, options1, options2, votes1, votes2, isActive] = await voteContract.getAllPolls()

		expect(questions[0]).to.equal("What is your favorite color?")
		expect(options1[0]).to.equal("Red")
		expect(options2[0]).to.equal("Blue")
		expect(votes1[0][0]).to.equal(wallet2.address)
		expect(votes2[0][0]).to.equal(wallet3.address)

		expect(questions[1]).to.equal("What is your favorite animal?")
		expect(options1[1]).to.equal("Dog")
		expect(options2[1]).to.equal("Cat")
		expect(votes1[1][0]).to.equal(wallet2.address)
		expect(votes2[1].length).to.equal(0)
	})

	it("Should end a poll", async function () {
		await voteContract.connect(owner).createPoll("What is your favorite color?", "Red", "Blue", 2)

		await voteContract.connect(wallet2).vote(0, true)
		await voteContract.connect(wallet3).vote(0, true)

		const [questions, options1, options2, votes1, votes2, isActive] = await voteContract.getPoll(0)

		expect(isActive).to.equal(false)
		expect(votes1[0]).to.equal(wallet2.address)
		expect(votes2.length).to.equal(0)
		// check votes 2 is empty
		// expect(votes2[0].length).to.equal(0)
	})

	it("Should reset a poll", async function () {
		await voteContract.connect(owner).createPoll("What is your favorite color?", "Red", "Blue", 2)
		await voteContract.connect(wallet2).vote(0, true)
		await voteContract.connect(wallet3).vote(0, false)

		const [questions, options1, options2, votes1, votes2, isActive] = await voteContract.getPoll(0)

		expect(isActive).to.equal(true)
		expect(votes1.length).to.equal(0)
		expect(votes2.length).to.equal(0)
	})
})
