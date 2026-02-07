const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const snarkjs = require("snarkjs");

const CIRCUIT_NAME = "ApprovalProof";
const CIRCUITS_DIR = path.join(__dirname, "..", "circuits");
const BUILD_DIR = path.join(__dirname, "..", "build");
const CONTRACTS_DIR = path.join(__dirname, "..", "contracts");

async function main() {
  console.log("🔧 Compiling ZK Circuit...\n");

  // Create build directory
  if (!fs.existsSync(BUILD_DIR)) {
    fs.mkdirSync(BUILD_DIR, { recursive: true });
  }

  const circuitPath = path.join(CIRCUITS_DIR, `${CIRCUIT_NAME}.circom`);
  const r1csPath = path.join(BUILD_DIR, `${CIRCUIT_NAME}.r1cs`);
  const wasmDir = path.join(BUILD_DIR, `${CIRCUIT_NAME}_js`);
  const wasmPath = path.join(wasmDir, `${CIRCUIT_NAME}.wasm`);
  const zKeyPath = path.join(BUILD_DIR, `${CIRCUIT_NAME}.zkey`);
  const vKeyPath = path.join(BUILD_DIR, "verification_key.json");
  const verifierPath = path.join(CONTRACTS_DIR, "Groth16Verifier.sol");

  try {
    // Step 1: Compile the circuit
    console.log("📦 Step 1: Compiling circuit to R1CS and WASM...");
    execSync(
      `npx circom "${circuitPath}" --r1cs --wasm --sym -o "${BUILD_DIR}"`,
      { stdio: "inherit" }
    );
    console.log("✅ Circuit compiled successfully!\n");

    // Step 2: Powers of Tau ceremony (using pre-computed for dev)
    console.log("🔑 Step 2: Setting up trusted setup...");
    const ptauPath = path.join(BUILD_DIR, "pot12_final.ptau");
    
    if (!fs.existsSync(ptauPath)) {
      console.log("   Generating powers of tau (this takes a moment)...");
      await snarkjs.powersOfTau.newAccumulator(12, ptauPath + ".temp");
      await snarkjs.powersOfTau.contribute(
        ptauPath + ".temp",
        ptauPath + ".temp2",
        "First contribution",
        "random-text-for-entropy-abc123"
      );
      await snarkjs.powersOfTau.preparePhase2(ptauPath + ".temp2", ptauPath);
      // Cleanup temp files
      if (fs.existsSync(ptauPath + ".temp")) fs.unlinkSync(ptauPath + ".temp");
      if (fs.existsSync(ptauPath + ".temp2")) fs.unlinkSync(ptauPath + ".temp2");
    }
    console.log("✅ Trusted setup complete!\n");

    // Step 3: Generate zKey
    console.log("🔐 Step 3: Generating proving key (zKey)...");
    await snarkjs.zKey.newZKey(r1csPath, ptauPath, zKeyPath + ".temp");
    await snarkjs.zKey.contribute(
      zKeyPath + ".temp",
      zKeyPath,
      "Contributor 1",
      "entropy-for-zkey-contribution"
    );
    if (fs.existsSync(zKeyPath + ".temp")) fs.unlinkSync(zKeyPath + ".temp");
    console.log("✅ Proving key generated!\n");

    // Step 4: Export verification key
    console.log("📄 Step 4: Exporting verification key...");
    const vKey = await snarkjs.zKey.exportVerificationKey(zKeyPath);
    fs.writeFileSync(vKeyPath, JSON.stringify(vKey, null, 2));
    console.log("✅ Verification key exported!\n");

    // Step 5: Generate Solidity verifier
    console.log("📝 Step 5: Generating Solidity verifier contract...");
    const verifierCode = await snarkjs.zKey.exportSolidityVerifier(zKeyPath, {
      groth16: fs.readFileSync(
        path.join(__dirname, "..", "node_modules", "snarkjs", "templates", "verifier_groth16.sol.ejs"),
        "utf8"
      ),
    });
    fs.writeFileSync(verifierPath, verifierCode);
    console.log("✅ Verifier contract generated!\n");

    console.log("🎉 Circuit compilation complete!");
    console.log(`   - WASM: ${wasmPath}`);
    console.log(`   - zKey: ${zKeyPath}`);
    console.log(`   - Verification Key: ${vKeyPath}`);
    console.log(`   - Verifier Contract: ${verifierPath}`);

  } catch (error) {
    console.error("❌ Error during compilation:", error.message);
    process.exit(1);
  }
}

main().catch(console.error);
