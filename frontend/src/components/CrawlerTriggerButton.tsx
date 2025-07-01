"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Image from 'next/image';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function CrawlerTriggerButton() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!session) return null;

  async function handleTrigger() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/crawler/run`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to trigger crawler");
      const data = await res.json();
      setMessage("Crawler triggered successfully!");
    } catch {
      setMessage("Failed to trigger crawler");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={handleTrigger}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
      >
        <Image src="/globe.svg" alt="Globe" width={20} height={20} />
        {loading ? "Generating..." : "Generate Trending Articles"}
      </button>
      {message && <div className="mt-2 text-sm text-gray-700">{message}</div>}
    </div>
  );
} 