import { groth16 } from "snarkjs";
import { ethers } from "ethers";
import { buildPoseidon } from "circomlibjs";

export function deriveSecret(wallet) {
  return BigInt(
    ethers.keccak256(
      ethers.getBytes(wallet.toLowerCase())
    )
  );
}

export async function computeNullifier(secret) {
  const poseidon = await buildPoseidon();
  const n = poseidon([secret, 1337n]);
  return "0x" + n.toString(16).padStart(64, "0");
}

export function packGroth16(proof) {
  const a = proof.pi_a.slice(0, 2);
  const b = proof.pi_b.slice(0, 2).map((row) => row.slice(0, 2));
  const c = proof.pi_c.slice(0, 2);

  return ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256[2]", "uint256[2][2]", "uint256[2]"],
    [a, b, c]
  );
}

export async function generateWalletProof(secret, merkle) {
  const input = {
    secret: secret.toString(),
    root: merkle.root,
    pathElements: merkle.pathElements,
    pathIndices: merkle.pathIndices
  };

  const wasm = await fetch("/zk/circuit.wasm").then((r) => r.arrayBuffer());
  const zkey = await fetch("/zk/circuit_final.zkey").then((r) => r.arrayBuffer());

  const { proof, publicSignals } = await groth16.fullProve(
    input,
    new Uint8Array(wasm),
    new Uint8Array(zkey)
  );

  return { proof, publicSignals };
}
