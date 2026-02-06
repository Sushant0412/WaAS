async function main() {
  const EventAccess = await ethers.getContractFactory("ZKEventAccess");
  const eventAccess = await EventAccess.deploy("0x3591D9b58d913e011CcCDf6ef5C058FC00a14218");

  await eventAccess.waitForDeployment();

  console.log("EventAccess deployed at:", await eventAccess.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
