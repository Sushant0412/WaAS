"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useWeb3 } from "@/app/providers";
import WalletButton from "@/components/WalletButton";
import dynamic from "next/dynamic";

// Dynamically import FloatingLines to avoid SSR issues with Three.js
const FloatingLines = dynamic(() => import("@/app/components/FloatingLines"), {
    ssr: false,
    loading: () => null,
});

export default function AdminLogin() {
    const { isConnected } = useWeb3();
    const router = useRouter();

    useEffect(() => {
        if (isConnected) {
            router.push("/admin/dashboard");
        }
    }, [isConnected, router]);

    return (
        <div className="min-h-screen bg-zinc-950 relative overflow-hidden flex flex-col">
            {/* FloatingLines WebGL Animation Background */}
            <div className="fixed inset-0 z-0 opacity-50 pointer-events-none">
                <FloatingLines
                    linesGradient={["#f97316", "#ec4899"]}
                    enabledWaves={["middle", "bottom"]}
                    lineCount={[3, 2]}
                    lineDistance={[5, 4]}
                    animationSpeed={0.5}
                    interactive={false}
                    parallax={true}
                    parallaxStrength={0.1}
                    mixBlendMode="screen"
                />
            </div>

            {/* Subtle gradient overlay */}
            <div className="fixed inset-0 z-0 bg-gradient-to-b from-transparent via-zinc-950/30 to-zinc-950/80 pointer-events-none" />

            {/* Navigation - Minimal */}
            <nav className="relative z-10 flex items-center justify-between px-8 py-6">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <span className="text-white font-medium group-hover:text-orange-400 transition-colors">OSMOSIS</span>
                </Link>

                <Link
                    href="/"
                    className="px-5 py-2 text-zinc-400 hover:text-white transition-all duration-300 text-sm hover:scale-105"
                >
                    ← Back
                </Link>
            </nav>

            {/* Main Content - Full Screen Centered */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 -mt-16">
                <div className="text-center max-w-md w-full">
                    {/* Title */}
                    <h1
                        className="text-5xl md:text-7xl font-bold leading-none tracking-wider mb-4"
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    >
                        <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                            ADMIN
                        </span>
                    </h1>

                    <p className="text-zinc-400 text-lg mb-12">
                        Connect your wallet to continue
                    </p>

                    {/* Wallet Button Container */}
                    <div className="flex justify-center mb-8">
                        <WalletButton />
                    </div>

                    {/* Info Card - Minimal */}
                    <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <p className="text-sm text-zinc-300">
                                    Requires MetaMask
                                </p>
                                <a
                                    href="https://metamask.io/download/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
                                >
                                    Download →
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer - Minimal */}
            <footer className="relative z-10 py-6 text-center">
                <p className="text-zinc-600 text-xs">
                    Whitelist as a Service
                </p>
            </footer>
        </div>
    );
}
