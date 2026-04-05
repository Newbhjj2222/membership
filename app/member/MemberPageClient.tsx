// app/member/MemberPageClient.tsx
"use client";
import React, { useEffect, useState } from "react";
import { FaUserFriends, FaUserShield, FaHandsHelping, FaWhatsapp } from "react-icons/fa";
import Link from "next/link";

interface Member {
  username: string;
  role: "member" | "advisor" | "sponsor";
  isMember: boolean;
  subscriptionExpiresAt: { seconds: number };
}

interface Props {
  members: Member[];
}

export default function MemberPageClient({ members }: Props) {
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: string }>({});

  // 🔹 Countdown live
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimes: { [key: string]: string } = {};
      members.forEach((m) => {
        const expiry = new Date(m.subscriptionExpiresAt.seconds * 1000).getTime();
        const now = Date.now();
        const diff = expiry - now;
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const mins = Math.floor((diff / (1000 * 60)) % 60);
          const secs = Math.floor((diff / 1000) % 60);
          newTimes[m.username] = `${days}d ${hours}h ${mins}m ${secs}s`;
        } else {
          newTimes[m.username] = "Expired";
        }
      });
      setTimeLeft(newTimes);
    }, 1000);

    return () => clearInterval(interval);
  }, [members]);

  const roleIcons = {
    member: <FaUserFriends size={24} />,
    advisor: <FaUserShield size={24} />,
    sponsor: <FaHandsHelping size={24} />,
  };

  const roleColors = {
    member: "bg-blue-100",
    advisor: "bg-green-100",
    sponsor: "bg-yellow-100",
  };

  return (
    <div className="min-h-screen p-6 bg-[var(--background)] text-[var(--foreground)] font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Your memberships in our family. Agaciro kawe niko kacu.
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(["member", "advisor", "sponsor"] as const).map((role) => {
          const filtered = members.filter((m) => m.role === role);
          return (
            <div key={role} className={`p-6 rounded-xl shadow ${roleColors[role]}`}>
              <div className="flex items-center gap-3 mb-4">
                {roleIcons[role]}
                <h2 className="text-xl font-semibold capitalize">{role}</h2>
              </div>
              {filtered.length === 0 && <p className="italic">You have no {role} role yet.</p>}
              {filtered.map((m) => (
                <div key={m.username} className="border-t border-gray-300 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{m.username}</span>
                    <span className="px-2 py-1 rounded-full bg-gray-200 text-sm">
                      {m.isMember ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm mt-1">
                    Expires in: {timeLeft[m.username] || "-"}
                  </p>
                  <Link
                    href={`https://wa.me/250722319367`}
                    target="_blank"
                    className="flex items-center gap-2 mt-2 text-white bg-green-500 px-3 py-2 rounded hover:bg-green-600 transition"
                  >
                    <FaWhatsapp /> Contact Support
                  </Link>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
