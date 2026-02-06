const { buildPoseidon } = require("circomlibjs");
const { MerkleTree } = require("merkletreejs");

// Poseidon expects BigInt
function toBigInt(x) {
    if (typeof x === "bigint") return x;
    return BigInt(x);
}

// Wrap node hashing using Poseidon
async function hashFunctionFactory() {
    const poseidon = await buildPoseidon();

    return (inputs) => {
        const res = poseidon(inputs.map(toBigInt));
        return poseidon.F.toString(res);  // convert field element → decimal string
    };
}

// Build a Poseidon-based Merkle tree
async function buildTree(secrets, levels = 20) {
    const poseidonHash = await hashFunctionFactory();

    // Generate leaves: leaf = Poseidon(secret)
    const leaves = secrets.map((s) => poseidonHash([s]));

    // Merkle tree using Poseidon(left, right)
    const tree = new MerkleTree(
        leaves,
        (x) => poseidonHash([BigInt("0x" + x.toString("hex"))]), // wrapper
        {
            hashLeaves: false,
            sortPairs: false,
        }
    );

    const root = tree.getRoot().toString("hex");

    return { tree, root, poseidonHash };
}

// Get Merkle proof for secret
async function generateProof(secret, secrets, levels = 20) {
    const { tree, root, poseidonHash } = await buildTree(secrets, levels);

    const leaf = poseidonHash([secret]);

    const proof = tree.getProof(leaf);

    // Convert proof to circom inputs
    const pathElements = proof.map((p) => BigInt("0x" + p.data.toString("hex")).toString());
    const pathIndices = proof.map((p) => p.position === "right" ? 1 : 0);

    return {
        root: "0x" + root,
        leaf,
        pathElements,
        pathIndices
    };
}

// Export for use in other scripts
module.exports = { generateProof };
