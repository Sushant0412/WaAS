"use client"
import { useState } from "react";
import QRScanner from "../../components/QRScanner";

export default function ScanPage() {
  const [secret, setSecret] = useState("");

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Scan Event QR Code</h2>

      {!secret && (
        <QRScanner
          onScan={(s) => {
            setSecret(s);
          }}
        />
      )}

      {secret && (
        <div style={{ marginTop: "20px" }}>
          <h3>Secret Extracted</h3>
          <code style={{ fontSize: "20px" }}>{secret}</code>

          <br /><br />

          <button
            onClick={() =>
              window.location.href = `/prove?secret=${secret}`
            }
            style={{
              padding: "10px 20px",
              background: "black",
              color: "white",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Continue to Proof Generation
          </button>
        </div>
      )}
    </div>
  );
}
