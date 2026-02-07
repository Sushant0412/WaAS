---
description: How to compile the ZK circuit and deploy contracts
---

# ZK Circuit & Contract Setup

This workflow explains how to set up the ZK-proof blockchain infrastructure for WaAS.

## Prerequisites
- Node.js installed
- Circom 2.x installed globally (`npm install -g circom`)

## Steps

### 1. Install BC Dependencies
```bash
cd BC
npm install
```

### 2. Compile the Circom Circuit
// turbo
```bash
cd BC
npm run compile:circuit
```
This will:
- Compile `circuits/ApprovalProof.circom` to R1CS and WASM
- Generate the trusted setup (powers of tau)
- Create the proving key (zkey)
- Export the verification key
- Generate the Solidity verifier contract

### 3. Compile Solidity Contracts
// turbo
```bash
cd BC
npx hardhat compile
```

### 4. Start Local Hardhat Node
```bash
cd BC
npm run node
```
Keep this terminal running.

### 5. Deploy Contracts
In a new terminal:
// turbo
```bash
cd BC
npm run deploy
```
This will:
- Deploy Groth16Verifier contract
- Deploy WhitelistRegistry contract
- Save deployment addresses to `BC/deployments/localhost.json`
- Export ABI to `BC/abi/WhitelistRegistry.json`

### 6. Install Backend Dependencies
// turbo
```bash
cd backend
npm install
```

### 7. Start Backend Server
```bash
cd backend
npm run dev
```

### 8. Start Frontend
```bash
cd waas
npm run dev
```

## Testing ZK Proof Generation

1. Navigate to admin dashboard
2. Create a test event
3. Register for the event with a different wallet
4. Approve the registration
5. Check console for "ZK proof generated" message
6. View the approved registration to see "ZK Verified" badge

## Notes
- The first approval will use mock proofs until the circuit is compiled
- Circuit compilation can take 2-5 minutes
- Deploy to a testnet by adding network config to `BC/hardhat.config.js`
