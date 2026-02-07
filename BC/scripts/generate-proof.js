const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

/**
 * Generate a ZK proof for testing
 */
async function main() {
  console.log("🔐 Generating ZK Proof...\n");

  const buildDir = path.join(__dirname, "..", "build");
  const wasmPath = path.join(buildDir, "ApprovalProof_js", "ApprovalProof.wasm");
  const zkeyPath = path.join(buildDir, "ApprovalProof.zkey");
  const vkeyPath = path.join(buildDir, "verification_key.json");

  // Check if build files exist
  if (!fs.existsSync(wasmPath) || !fs.existsSync(zkeyPath)) {
    console.error("❌ Build files not found. Run 'npm run compile:circuit' first.");
    process.exit(1);
  }

  // Sample input - in production, these would come from the backend
  const input = {
    walletHash: "12345678901234567890123456789012",
    adminSecret: "98765432109876543210987654321098",
    timestamp: Math.floor(Date.now() / 1000).toString(),
    eventId: "1",
    // Nullifier will be computed by the circuit - for now use a placeholder
    nullifier: "0", // This needs to match Poseidon(walletHash, eventId)
  };

  console.log("📥 Input signals:");
  console.log(JSON.stringify(input, null, 2));
  console.log("");

  try {
    // Generate the proof
    console.log("⏳ Generating proof (this may take a moment)...");
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      wasmPath,
      zkeyPath
    );

    console.log("\n✅ Proof generated successfully!");
    console.log("\n📤 Public signals:", publicSignals);

    // Format for Solidity
    const calldata = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
    console.log("\n📝 Solidity calldata:");
    console.log(calldata);

    // Verify the proof locally
    console.log("\n🔍 Verifying proof locally...");
    const vkey = JSON.parse(fs.readFileSync(vkeyPath, "utf8"));
    const verified = await snarkjs.groth16.verify(vkey, publicSignals, proof);
    
    if (verified) {
      console.log("✅ Proof verified successfully!");
    } else {
      console.log("❌ Proof verification failed!");
    }

    // Save proof for testing
    const proofOutput = {
      proof,
      publicSignals,
      calldata,
      verified,
      generatedAt: new Date().toISOString(),
    };
    
    const outputPath = path.join(buildDir, "sample_proof.json");
    fs.writeFileSync(outputPath, JSON.stringify(proofOutput, null, 2));
    console.log(`\n📄 Proof saved to: ${outputPath}`);

  } catch (error) {
    console.error("❌ Error generating proof:", error.message);
    process.exit(1);
  }
}

main().catch(console.error);
