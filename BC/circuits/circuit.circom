pragma circom 2.1.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

template MembershipProof(levels) {
    // Private Inputs
    signal input secret;
    signal input pathElements[levels];
    signal input pathIndices[levels];

    // Public Inputs
    signal input root;

    // Public Outputs
    signal output nullifierHash;

    // 1. Generate Leaf: leaf = Poseidon(secret)
    component leafHasher = Poseidon(1);
    leafHasher.inputs[0] <== secret;
    
    // 2. Verify Merkle Inclusion
    signal hashes[levels + 1];
    hashes[0] <== leafHasher.out;

    component hashers[levels];
    
    for (var i = 0; i < levels; i++) {
        hashers[i] = Poseidon(2);
        
        // This logic ensures quadratic constraints:
        // If pathIndices[i] == 0: hashers.in[0] = hashes[i], hashers.in[1] = pathElements[i]
        // If pathIndices[i] == 1: hashers.in[0] = pathElements[i], hashers.in[1] = hashes[i]
        
        hashers[i].inputs[0] <== (pathElements[i] - hashes[i]) * pathIndices[i] + hashes[i];
        hashers[i].inputs[1] <== (hashes[i] - pathElements[i]) * pathIndices[i] + pathElements[i];

        hashes[i + 1] <== hashers[i].out;
    }

    // Root check
    hashes[levels] === root;

    // 3. Generate Nullifier
    component nHasher = Poseidon(2);
    nHasher.inputs[0] <== secret;
    nHasher.inputs[1] <== 1337; // Salt
    nullifierHash <== nHasher.out;
}

component main {public [root]} = MembershipProof(20);