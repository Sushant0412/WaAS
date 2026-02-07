import { ethers } from "ethers";
import {abi} from "./Verifier";

export async function submitZKProof(eventId, proofBytes, nullifierHash) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const contract = new ethers.Contract(
    "0x3591D9b58d913e011CcCDf6ef5C058FC00a14218",
    abi,
    signer
  );

  const tx = await contract.proveAccess(
    eventId,
    proofBytes,
    nullifierHash
  );

  return tx.wait();
}
