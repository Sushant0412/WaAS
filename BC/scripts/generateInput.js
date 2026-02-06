const { buildPoseidon } = require("circomlibjs");
const fs = require("fs");

async function run() {
    const poseidon = await buildPoseidon();
    
    // 1. Secret and Leaf
    const secret = BigInt(123456);
    const leaf = poseidon.F.toObject(poseidon([secret]));
    console.log("Leaf (Poseidon):", leaf.toString());

    // 2. Generate a valid path for a 20-level tree
    // For this test, we'll assume all siblings are "0"
    const levels = 20;
    let pathElements = new Array(levels).fill("0");
    let pathIndices = new Array(levels).fill(0);

    // 3. Manually calculate the resulting root
    let currentHash = leaf;
    for (let i = 0; i < levels; i++) {
        // Simple logic: if index is 0, currentHash is left. If 1, it's right.
        // Since siblings are "0", we just hash (currentHash, 0)
        currentHash = poseidon.F.toObject(poseidon([currentHash, BigInt(pathElements[i])]));
    }

    const root = currentHash.toString();
    console.log("Calculated Root:", root);

    // 4. Create the input object
    const input = {
        "secret": secret.toString(),
        "root": root,
        "pathElements": pathElements,
        "pathIndices": pathIndices
    };

    fs.writeFileSync("./circuits/input.json", JSON.stringify(input, null, 2));
    console.log("New input.json generated successfully!");
}

run();