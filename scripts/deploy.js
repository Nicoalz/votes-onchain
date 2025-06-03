async function main() {
  const Safe = await hre.ethers.getContractFactory("Vote");
  const safe = await Safe.deploy();
  await safe.waitForDeployment();

  console.log("Vote deployed to:", await safe.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 