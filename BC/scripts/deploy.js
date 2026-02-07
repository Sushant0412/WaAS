const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying contracts to network...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());
  console.log("");

  // Deploy Groth16Verifier first
  console.log("📦 Deploying Groth16Verifier...");
  const Groth16Verifier = await hre.ethers.getContractFactory("Groth16Verifier");
  const verifier = await Groth16Verifier.deploy();
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log("✅ Groth16Verifier deployed to:", verifierAddress);

  // Deploy WhitelistRegistry with verifier address
  console.log("\n📦 Deploying WhitelistRegistry...");
  const WhitelistRegistry = await hre.ethers.getContractFactory("WhitelistRegistry");
  const registry = await WhitelistRegistry.deploy(verifierAddress);
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("✅ WhitelistRegistry deployed to:", registryAddress);

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await deployer.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    contracts: {
      Groth16Verifier: verifierAddress,
      WhitelistRegistry: registryAddress,
    },
    deployedAt: new Date().toISOString(),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentPath = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n📄 Deployment info saved to:", deploymentPath);

  // Export ABI for frontend
  const abiDir = path.join(__dirname, "..", "abi");
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }

  // Get and save WhitelistRegistry ABI
  const registryArtifact = await hre.artifacts.readArtifact("WhitelistRegistry");
  fs.writeFileSync(
    path.join(abiDir, "WhitelistRegistry.json"),
    JSON.stringify({ abi: registryArtifact.abi, address: registryAddress }, null, 2)
  );
  console.log("📄 WhitelistRegistry ABI exported to abi/WhitelistRegistry.json");

  console.log("\n🎉 Deployment complete!");
  console.log("\n📋 Summary:");
  console.log(`   Groth16Verifier: ${verifierAddress}`);
  console.log(`   WhitelistRegistry: ${registryAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
