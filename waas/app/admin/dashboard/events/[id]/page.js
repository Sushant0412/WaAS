"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = "http://localhost:5000";

export default function EventDetailPage({ params }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [event, setEvent] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRevokeModal, setShowRevokeModal] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const [revokeReason, setRevokeReason] = useState("");
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchEvent();
        fetchRegistrations();
    }, [resolvedParams.id]);

    const fetchEvent = async () => {
        try {
            const res = await fetch(`${API_URL}/events/${resolvedParams.id}`);
            const data = await res.json();
            setEvent(data);
        } catch (err) {
            console.error("Error fetching event:", err);
        }
        setLoading(false);
    };

    const fetchRegistrations = async () => {
        try {
            const res = await fetch(`${API_URL}/register/event/${resolvedParams.id}`);
            const data = await res.json();
            setRegistrations(data);
        } catch (err) {
            console.error("Error fetching registrations:", err);
        }
    };

    const showNotification = (message) => {
        setSuccessMessage(message);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 4000);
    };

    const approveRegistration = async (registrationId, approvalType) => {
        try {
            const message = approvalType === "qr"
                ? "Please check your email for QR code"
                : "You are approved!";

            await fetch(`${API_URL}/register/approve/${registrationId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });

            fetchRegistrations();
            showNotification(
                approvalType === "qr"
                    ? "Approved! Email notification sent."
                    : "Approved! User will see 'You are approved!'"
            );
        } catch (err) {
            console.error("Error approving registration:", err);
        }
    };

    const rejectRegistration = async (registrationId) => {
        try {
            await fetch(`${API_URL}/register/reject/${registrationId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: "Your registration has been rejected" }),
            });

            fetchRegistrations();
            showNotification("Registration rejected");
        } catch (err) {
            console.error("Error rejecting registration:", err);
        }
    };

    const revokeApproval = async () => {
        if (!selectedRegistration) return;

        try {
            await fetch(`${API_URL}/register/revoke/${selectedRegistration._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason: revokeReason || "Revoked by admin" }),
            });

            fetchRegistrations();
            setShowRevokeModal(false);
            setSelectedRegistration(null);
            setRevokeReason("");
            showNotification("Approval revoked successfully");
        } catch (err) {
            console.error("Error revoking approval:", err);
        }
    };

    const deleteEvent = async () => {
        setDeleting(true);
        try {
            await fetch(`${API_URL}/events/${resolvedParams.id}`, {
                method: "DELETE",
            });
            router.push("/admin/dashboard");
        } catch (err) {
            console.error("Error deleting event:", err);
            setDeleting(false);
        }
    };

    const truncateAddress = (address) => {
        if (!address) return "";
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "approved":
                return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
            case "rejected":
                return "bg-red-500/20 text-red-400 border-red-500/30";
            case "cancelled":
                return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
            default:
                return "bg-amber-500/20 text-amber-400 border-amber-500/30";
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="p-8">
                <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800 p-12 text-center">
                    <p className="text-zinc-400 mb-4">Event not found</p>
                    <Link href="/admin/dashboard" className="text-orange-400 hover:text-orange-300">
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const pendingRegistrations = registrations.filter(r => r.status === "pending");
    const approvedRegistrations = registrations.filter(r => r.status === "approved");
    const rejectedRegistrations = registrations.filter(r => r.status === "rejected");
    const cancelledRegistrations = registrations.filter(r => r.status === "cancelled");

    return (
        <div className="min-h-screen bg-zinc-950 p-8">
            {/* Success Toast */}
            {showSuccess && (
                <div className="fixed top-6 right-6 z-50 animate-slide-in">
                    <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-6 py-4 flex items-center gap-3 backdrop-blur-xl">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-emerald-400 font-medium">{successMessage}</p>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
                    <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-white mb-4">Delete Event?</h3>
                        <p className="text-zinc-400 mb-6">
                            This will permanently delete <span className="text-white font-medium">{event.title}</span> and all its registrations. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={deleteEvent}
                                disabled={deleting}
                                className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {deleting ? "Deleting..." : "Delete Event"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Revoke Approval Modal */}
            {showRevokeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowRevokeModal(false)} />
                    <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-white mb-4">Revoke Approval</h3>
                        <p className="text-zinc-400 mb-4">
                            Remove <span className="text-white font-mono">{truncateAddress(selectedRegistration?.walletAddress)}</span> from the whitelist?
                        </p>
                        <textarea
                            value={revokeReason}
                            onChange={(e) => setRevokeReason(e.target.value)}
                            placeholder="Reason for revoking (optional)"
                            className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 mb-4 resize-none"
                            rows={3}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowRevokeModal(false); setSelectedRegistration(null); setRevokeReason(""); }}
                                className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={revokeApproval}
                                className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
                            >
                                Revoke Access
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-white">{event.title}</h1>
                            <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${event.approvalType === "qr"
                                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                }`}>
                                {event.approvalType === "qr" ? "QR Code" : "Wallet Whitelist"}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-zinc-400 text-sm">
                            {event.place && <span>📍 {event.place}</span>}
                            {event.date && <span>📅 {event.date}</span>}
                            {event.fee && <span>💰 {event.fee}</span>}
                        </div>
                    </div>

                    {/* Delete Button */}
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Event
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-zinc-900/60 rounded-xl p-4 border border-zinc-800/50">
                    <p className="text-zinc-500 text-xs mb-1">Total</p>
                    <p className="text-2xl font-bold text-white">{registrations.length}</p>
                </div>
                <div className="bg-zinc-900/60 rounded-xl p-4 border border-zinc-800/50">
                    <p className="text-amber-400 text-xs mb-1">Pending</p>
                    <p className="text-2xl font-bold text-amber-400">{pendingRegistrations.length}</p>
                </div>
                <div className="bg-zinc-900/60 rounded-xl p-4 border border-zinc-800/50">
                    <p className="text-emerald-400 text-xs mb-1">Approved</p>
                    <p className="text-2xl font-bold text-emerald-400">{approvedRegistrations.length}</p>
                </div>
                <div className="bg-zinc-900/60 rounded-xl p-4 border border-zinc-800/50">
                    <p className="text-zinc-400 text-xs mb-1">Cancelled/Rejected</p>
                    <p className="text-2xl font-bold text-zinc-400">{cancelledRegistrations.length + rejectedRegistrations.length}</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Pending Approvals */}
                <div className="bg-zinc-900/60 backdrop-blur-xl rounded-2xl border border-zinc-800/50 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-white">
                            Pending Approvals ({pendingRegistrations.length})
                        </h2>
                        <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Requires Action
                        </span>
                    </div>

                    {pendingRegistrations.length === 0 ? (
                        <p className="text-zinc-500 text-center py-8">No pending approvals</p>
                    ) : (
                        <div className="space-y-3">
                            {pendingRegistrations.map((reg) => (
                                <div
                                    key={reg._id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 border border-zinc-700"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-white">
                                                {event.approvalType === "qr" ? (
                                                    <span>{reg.email || "No email provided"}</span>
                                                ) : (
                                                    <span className="font-mono">{truncateAddress(reg.walletAddress)}</span>
                                                )}
                                            </p>
                                            <p className="text-zinc-500 text-xs">
                                                Requested {new Date(reg.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => rejectRegistration(reg._id)}
                                            className="px-4 py-2 rounded-xl bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => approveRegistration(reg._id, event.approvalType)}
                                            className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${event.approvalType === "qr"
                                                ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white"
                                                : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white"
                                                }`}
                                        >
                                            {event.approvalType === "qr" ? "Approve & Send QR" : "Approve"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Approved List */}
                <div className="bg-zinc-900/60 backdrop-blur-xl rounded-2xl border border-zinc-800/50 p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        Approved ({approvedRegistrations.length})
                    </h2>

                    {approvedRegistrations.length === 0 ? (
                        <p className="text-zinc-500 text-center py-8">No approved registrations yet</p>
                    ) : (
                        <div className="space-y-3">
                            {approvedRegistrations.map((reg) => (
                                <div
                                    key={reg._id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 border border-zinc-700"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-white">
                                                {event.approvalType === "qr" ? (
                                                    <span>{reg.email || "No email provided"}</span>
                                                ) : (
                                                    <span className="font-mono">{truncateAddress(reg.walletAddress)}</span>
                                                )}
                                            </p>
                                            <p className="text-emerald-400 text-xs">{reg.adminMessage}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { setSelectedRegistration(reg); setShowRevokeModal(true); }}
                                        className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors"
                                    >
                                        Revoke
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Cancelled/Rejected List */}
                {(cancelledRegistrations.length > 0 || rejectedRegistrations.length > 0) && (
                    <div className="bg-zinc-900/60 backdrop-blur-xl rounded-2xl border border-zinc-800/50 p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">
                            Cancelled / Rejected ({cancelledRegistrations.length + rejectedRegistrations.length})
                        </h2>

                        <div className="space-y-3">
                            {[...cancelledRegistrations, ...rejectedRegistrations].map((reg) => (
                                <div
                                    key={reg._id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-zinc-700/50 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-zinc-400">
                                                {event.approvalType === "qr" ? (
                                                    <span>{reg.email || "No email provided"}</span>
                                                ) : (
                                                    <span className="font-mono">{truncateAddress(reg.walletAddress)}</span>
                                                )}
                                            </p>
                                            <p className="text-zinc-500 text-xs">
                                                {reg.cancellationReason || reg.adminMessage || "No reason provided"}
                                                {reg.cancelledBy && <span className="text-zinc-600"> · By {reg.cancelledBy}</span>}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusBadge(reg.status)}`}>
                                        {reg.status === "cancelled" ? "Cancelled" : "Rejected"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* CSS for animation */}
            <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
        </div>
    );
}
