import { useEffect, useRef } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

export default function QRScanner({ onScan }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
  "qr-scanner",
  {
    fps: 10,
    qrbox: { width: 300, height: 300 },
    aspectRatio: 1.0,
    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
  },
  false
);


    scanner.render(
      (decodedText) => {
        try {
          const payload = JSON.parse(decodedText);

          if (payload.secret) {
            onScan(payload.secret);
          } else {
            alert("QR does not contain secret field");
          }
        } catch (e) {
          alert("Invalid QR code format");
        }
      },
      (err) => {
        console.warn("QR error:", err);
      }
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  return (
    <div>
      <div id="qr-scanner" style={{ width: "300px", margin: "auto" }}></div>
    </div>
  );
}
