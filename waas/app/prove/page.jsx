"use client"
import { useState } from "react";
import {
  deriveSecret,
  generateWalletProof,
  computeNullifier,
  packGroth16
} from "../../utils/zkWalletProof";

import { submitZKProof } from "../../utils/Contract";

export default function ProveAccess() {
  const [wallet, setWallet] = useState("");
  const [eventId, setEventId] = useState("");
  const [status, setStatus] = useState("");

  async function handleProve() {
    try {
      setStatus("Deriving secret...");

      const secret = deriveSecret(wallet);

      setStatus("Fetching Merkle path...");
      const merkle = await fetch(
        `${process.env.NEXT_PUBLIC_API}/events/${eventId}/merkle-data?wallet=${wallet}`
      ).then((r) => r.json());

      setStatus("Generating ZK proof...");
      const { proof } = await generateWalletProof(secret, merkle);

      const proofBytes = packGroth16(proof);
      const nullifier = await computeNullifier(secret);

      setStatus("Submitting on-chain...");
      await submitZKProof(eventId, proofBytes, nullifier);

      setStatus("ACCESS GRANTED");
    } catch (err) {
      console.error(err);
      setStatus("Error: " + err.message);
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>ZK Wallet Access Proof</h1>

      <input
        placeholder="Wallet Address"
        value={wallet}
        onChange={(e) => setWallet(e.target.value)}
        style={{ width: 400, marginBottom: 20 }}
      />

      <input
        placeholder="Event ID (Mongo _id)"
        value={eventId}
        onChange={(e) => setEventId(e.target.value)}
        style={{ width: 400, marginBottom: 20 }}
      />

      <button onClick={handleProve}>
        Generate ZK Proof & Access Event
      </button>

      <p>{status}</p>
    </div>
  );
}
