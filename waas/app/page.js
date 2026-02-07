"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWeb3 } from "./providers";
import { useState } from "react";
import dynamic from "next/dynamic";
import WalletButton from "@/components/WalletButton";

// Dynamically import FloatingLines to avoid SSR issues with Three.js
const FloatingLines = dynamic(() => import("./components/FloatingLines"), {
  ssr: false,
  loading: () => null,
});

export default function Home() {
  const router = useRouter();
  const { connectWallet, isConnected, isConnecting } = useWeb3();
  const [showWalletModal, setShowWalletModal] = useState(false);

  const handleViewEvents = async () => {
    if (isConnected) {
      router.push("/events");
    } else {
      const connected = await connectWallet();
      if (connected) {
        router.push("/events");
      }
    }
  };

  const handleCreateEvent = () => {
    if (isConnected) {
      router.push("/admin/dashboard");
    } else {
      setShowWalletModal(true);
    }
  };

  const handleAdminClick = () => {
    if (isConnected) {
      router.push("/admin/dashboard");
    } else {
      setShowWalletModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden flex flex-col">
      {/* FloatingLines WebGL Animation Background */}
      <div className="fixed inset-0 z-0 opacity-70 pointer-events-none">
        <FloatingLines
          linesGradient={["#f97316", "#ec4899"]}
          enabledWaves={["middle", "bottom"]}
          lineCount={[4, 3]}
          lineDistance={[6, 5]}
          animationSpeed={0.6}
          interactive={true}
          bendRadius={4.0}
          bendStrength={-0.3}
          parallax={true}
          parallaxStrength={0.1}
          mixBlendMode="screen"
        />
      </div>

      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-transparent via-zinc-950/30 to-zinc-950/80 pointer-events-none" />

      {/* Wallet Connect Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowWalletModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-fade-in">
            {/* Close button */}
            <button
              onClick={() => setShowWalletModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.05em" }}
              >
                Connect Wallet
              </h2>
              <p className="text-zinc-400 text-sm mt-2">
                Connect your wallet to create events
              </p>
            </div>

            {/* Wallet Button */}
            <div className="flex justify-center mb-6">
              <WalletButton />
            </div>

            {/* Info */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
              <svg className="w-5 h-5 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm">
                <span className="text-zinc-300">Need MetaMask? </span>
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-400 hover:text-orange-300 transition-colors"
                >
                  Download →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation - Minimal */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleViewEvents}
            disabled={isConnecting}
            className="px-5 py-2 text-zinc-400 hover:text-white transition-all duration-300 text-sm disabled:opacity-50 hover:scale-105"
          >
            {isConnecting ? "Connecting..." : "Events"}
          </button>
          <button
            onClick={handleAdminClick}
            className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/10"
          >
            Admin
          </button>
        </div>
      </nav>

      {/* Hero - Full Screen, Centered, Minimal */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 -mt-20">
        {/* Main Content */}
        <div className="text-center">
          {/* OSMOSIS - Big */}
          <h1
            className="text-[12rem] md:text-[16rem] lg:text-[20rem] font-bold leading-none tracking-wider"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
              OSMOSIS
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-2xl md:text-3xl lg:text-4xl text-zinc-400 -mt-4 md:-mt-6 tracking-wide"
            style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.2em" }}
          >
            <span className="text-white">WHITELIST</span> as a <span className="text-white">SERVICE</span>
          </p>

          {/* Tagline */}
          <p className="text-zinc-100 text-sm md:text-base mt-8 max-w-md mx-auto">
            Anonymous event whitelisting powered by ZK Proofs
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={handleCreateEvent}
              className="group px-8 py-3 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/25"
            >
              <span className="group-hover:tracking-wider transition-all duration-300">Create Event</span>
            </button>
            <button
              onClick={handleViewEvents}
              disabled={isConnecting}
              className="px-8 py-3 rounded-full border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/5 disabled:opacity-50"
            >
              {isConnecting ? "Connecting..." : "Browse Events"}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center">
        <p className="text-zinc-600 text-xs">
          ZK Proofs · Merkle Trees · Complete Privacy
        </p>
      </footer>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
