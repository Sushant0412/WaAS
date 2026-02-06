"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const API_URL = "http://localhost:5000";

export default function UserEventsPage() {
  const [wallet, setWallet] = useState(null);
  const [events, setEvents] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/events`);
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error("Error fetching events", err);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected");
      return null;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setWallet(accounts[0]);
    return accounts[0];
  };

  const registerEvent = async (event) => {
    let activeWallet = wallet;

    if (!activeWallet) {
      activeWallet = await connectWallet();
    }

    if (!activeWallet) return;

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: event._id,
          walletAddress: activeWallet,
        }),
      });

      await res.json();

      setStatusMessage(
        "Registration request sent. Waiting for admin approval.",
      );
    } catch (err) {
      console.error(err);
      setStatusMessage("Registration failed.");
    }
  };

  const checkApprovals = async () => {
    if (!wallet) return;

    const res = await fetch(`${API_URL}/register/user/${wallet}`);
    const data = await res.json();

    const approved = data.find((r) => r.status === "approved");

    if (approved) {
      if (approved.adminMessage?.toLowerCase().includes("qr")) {
        setStatusMessage("Admin approved. Check your email for QR.");
      } else {
        setStatusMessage(
          approved.adminMessage || "You have been approved for the event.",
        );
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      checkApprovals();
    }, 5000);

    return () => clearInterval(interval);
  }, [wallet]);

  return (
    <div className="p-6 grid gap-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-semibold">My Events</h1>

      {wallet && (
        <div className="text-sm text-green-600">Connected Wallet: {wallet}</div>
      )}

      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-blue-100 rounded-2xl"
        >
          {statusMessage}
        </motion.div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event._id} className="rounded-2xl shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="text-xl font-medium">{event.title}</div>

              <div className="text-sm text-gray-600">Place: {event.place}</div>

              <div className="text-sm text-gray-600">Date: {event.date}</div>

              <div className="text-sm text-gray-600">Fee: {event.fee}</div>

              <Button className="w-full" onClick={() => registerEvent(event)}>
                Register
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
