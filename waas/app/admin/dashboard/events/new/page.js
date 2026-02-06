"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWeb3 } from "@/app/providers";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import FloatingLines
const FloatingLines = dynamic(() => import("@/app/components/FloatingLines"), {
    ssr: false,
    loading: () => null,
});

const API_URL = "http://localhost:5000";

export default function CreateEventPage() {
    const router = useRouter();
    const { account, isConnected, disconnectWallet } = useWeb3();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: "",
        place: "",
        date: "",
        time: "",
        fee: "",
        image: "",
        approvalType: "wallet",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");
    const [imagePreview, setImagePreview] = useState("");

    const truncateAddress = (address) => {
        if (!address) return "";
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload to Cloudinary
        setIsUploading(true);
        setError("");

        try {
            const formDataUpload = new FormData();
            formDataUpload.append("image", file);

            const res = await fetch(`${API_URL}/upload`, {
                method: "POST",
                body: formDataUpload,
            });

            if (!res.ok) {
                throw new Error("Upload failed");
            }

            const data = await res.json();
            setFormData((prev) => ({ ...prev, image: data.url }));
        } catch (err) {
            console.error("Upload error:", err);
            setError("Failed to upload image. Please try again.");
            setImagePreview("");
        }
        setIsUploading(false);
    };

    const removeImage = () => {
        setFormData((prev) => ({ ...prev, image: "" }));
        setImagePreview("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const response = await fetch(`${API_URL}/events`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    createdBy: account,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create event");
            }

            await response.json();
            router.push("/admin/dashboard");
        } catch (err) {
            console.error(err);
            setError("Failed to create event. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
            {/* FloatingLines Background */}
            <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
                <FloatingLines
                    linesGradient={["#f97316", "#ec4899"]}
                    enabledWaves={["bottom"]}
                    lineCount={[3]}
                    lineDistance={[5]}
                    animationSpeed={0.4}
                    interactive={false}
                    mixBlendMode="screen"
                />
            </div>

            {/* Gradient overlay */}
            <div className="fixed inset-0 z-0 bg-gradient-to-b from-zinc-950/90 via-zinc-950/70 to-zinc-950 pointer-events-none" />

            {/* Navigation */}
            <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-zinc-800/50">
                <Link href="/admin/dashboard" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <span
                        className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors"
                        style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.05em" }}
                    >
                        OSMOSIS
                    </span>
                </Link>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800/50 border border-zinc-700">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                        <span className="text-zinc-300 text-sm">{truncateAddress(account)}</span>
                    </div>
                    <button
                        onClick={disconnectWallet}
                        className="px-4 py-2 text-zinc-400 hover:text-white transition-colors text-sm"
                    >
                        Disconnect
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 max-w-2xl mx-auto px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Dashboard
                    </Link>
                    <h1
                        className="text-4xl font-bold text-white mb-2"
                        style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.02em" }}
                    >
                        Create New Event
                    </h1>
                    <p className="text-zinc-500">Set up a new whitelist event</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-zinc-900/60 backdrop-blur-xl rounded-2xl border border-zinc-800/50 p-6 space-y-6">
                        {/* Event Title */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Event Title *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter event title"
                                className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-300"
                            />
                        </div>

                        {/* Place */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Place *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.place}
                                onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                                placeholder="Enter event location"
                                className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-300"
                            />
                        </div>

                        {/* Date and Time Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-300"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Time *
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-300"
                                />
                            </div>
                        </div>

                        {/* Fee */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Fee
                            </label>
                            <input
                                type="text"
                                value={formData.fee}
                                onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                                placeholder="e.g., Free, $10, 0.01 ETH"
                                className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-300"
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Event Image
                            </label>

                            {!imagePreview ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center cursor-pointer hover:border-orange-500/50 hover:bg-orange-500/5 transition-all duration-300 group"
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                    <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-500/20 transition-colors">
                                        <svg className="w-6 h-6 text-zinc-500 group-hover:text-orange-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-zinc-400 text-sm group-hover:text-zinc-300 transition-colors">
                                        Click to upload event image
                                    </p>
                                    <p className="text-zinc-600 text-xs mt-1">
                                        JPG, PNG, GIF or WebP (max 5MB)
                                    </p>
                                </div>
                            ) : (
                                <div className="relative rounded-xl overflow-hidden border border-zinc-700">
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-zinc-900/80 flex items-center justify-center z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                                                <span className="text-white">Uploading...</span>
                                            </div>
                                        </div>
                                    )}
                                    <img
                                        src={imagePreview}
                                        alt="Event preview"
                                        className="w-full h-48 object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 p-2 bg-zinc-900/80 rounded-lg text-zinc-400 hover:text-red-400 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    {formData.image && (
                                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                                            <span className="text-emerald-400 text-xs font-medium">✓ Uploaded</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Approval Type */}
                    <div className="bg-zinc-900/60 backdrop-blur-xl rounded-2xl border border-zinc-800/50 p-6">
                        <label className="block text-sm font-medium text-zinc-300 mb-4">
                            Approval Type *
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            {/* QR Code Option */}
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, approvalType: "qr" })}
                                className={`p-5 rounded-xl border-2 transition-all duration-300 text-left group ${formData.approvalType === "qr"
                                        ? "border-purple-500 bg-purple-500/10"
                                        : "border-zinc-700 bg-zinc-800/50 hover:border-purple-500/50 hover:bg-purple-500/5"
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl mb-3 flex items-center justify-center transition-all duration-300 ${formData.approvalType === "qr"
                                        ? "bg-gradient-to-br from-purple-500 to-pink-500"
                                        : "bg-zinc-700 group-hover:bg-purple-500/30"
                                    }`}>
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                    </svg>
                                </div>
                                <h4 className={`font-semibold mb-1 transition-colors ${formData.approvalType === "qr" ? "text-purple-400" : "text-white"
                                    }`}>
                                    QR Code
                                </h4>
                                <p className="text-sm text-zinc-400">
                                    Send unique QR codes to approved attendees via email
                                </p>
                            </button>

                            {/* Wallet Option */}
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, approvalType: "wallet" })}
                                className={`p-5 rounded-xl border-2 transition-all duration-300 text-left group ${formData.approvalType === "wallet"
                                        ? "border-emerald-500 bg-emerald-500/10"
                                        : "border-zinc-700 bg-zinc-800/50 hover:border-emerald-500/50 hover:bg-emerald-500/5"
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl mb-3 flex items-center justify-center transition-all duration-300 ${formData.approvalType === "wallet"
                                        ? "bg-gradient-to-br from-emerald-500 to-teal-500"
                                        : "bg-zinc-700 group-hover:bg-emerald-500/30"
                                    }`}>
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <h4 className={`font-semibold mb-1 transition-colors ${formData.approvalType === "wallet" ? "text-emerald-400" : "text-white"
                                    }`}>
                                    Wallet Whitelist
                                </h4>
                                <p className="text-sm text-zinc-400">
                                    Approve wallet addresses for on-chain verification
                                </p>
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting || isUploading || !formData.title || !formData.place || !formData.date || !formData.time}
                        className="group relative w-full py-4 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/25 overflow-hidden"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating Event...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Create Event
                            </span>
                        )}
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    </button>
                </form>
            </main>
        </div>
    );
}
