require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()

/** @type import('hardhat/config').HardhatUserConfig */

const sepoliaUrl = process.env.SEPOLIA_URL
const privateKey = process.env.PRIVATE_KEY

module.exports = {
	solidity: "0.8.28",
	networks: {
		sepolia: {
			url: sepoliaUrl,
			accounts: [privateKey],
		},
	},
}
