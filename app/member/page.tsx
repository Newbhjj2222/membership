// app/member/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { cookies } from "next/headers";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { FaUserShield, FaUserFriends, FaUserTie, FaWhatsapp } from "react-icons/fa";

interface MemberData {
  username?: string | null;
  isMember?: boolean;
  subscriptionExpiresAt?: { seconds: number; nanoseconds: number };
  createdAt?: { seconds: number; nanoseconds: number };
}

const WHATSAPP_NUMBER = "+250722319367";

const MemberPage: React.FC = () => {
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [countdown, setCountdown] = useState<string>("");

  // 🔹 Fata username muri cookies
  const cookieStore: any = cookies();
  const userCookie = cookieStore.get?.("user")?.value;
  const username = userCookie ? JSON.parse(userCookie).name : null;

  // 🔹 Fetch user data muri Firestore
  useEffect(() => {
    if (!username) return;

    const fetchMember = async () => {
      const docRef = doc(db, "members", username);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as MemberData;

        // 🔹 Recalculate subscriptionExpiresAt if missing
        if (!data.subscriptionExpiresAt && data.isMember) {
          const now = new Date();
          const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
          data.subscriptionExpiresAt = { seconds: Math.floor(oneYearLater.getTime() / 1000), nanoseconds: 0 };
        }

        setMemberData(data);
      }
    };

    fetchMember();
  }, [username]);

  // 🔹 Live countdown
  useEffect(() => {
    if (!memberData?.isMember || !memberData.subscriptionExpiresAt) return;

    const expiry = new Date(memberData.subscriptionExpiresAt.seconds * 1000);

    const interval = setInterval(() => {
      const now = new Date();
      const diff = expiry.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown("Membership yararangiye");
        clearInterval(interval);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s remaining`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [memberData]);

  return (
    <div className="min-h-screen p-4 bg-[var(--background)] text-[var(--foreground)]">
      <h1 className="text-3xl text-center font-bold mb-8">
        Your members in our family
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* 🔹 Umunyamuryango */}
        <div className="bg-[var(--background)] border rounded-lg shadow p-6 flex flex-col items-center text-center relative">
          {memberData?.isMember && (
            <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              MEMBER
            </span>
          )}
          <FaUserShield size={50} className="mb-3 text-[#008489]" />
          <h2 className="font-semibold text-lg">Umunyamuryango wacu</h2>
          <p className="text-sm mt-2">{username || "Nta username"}</p>
          <p className="text-sm mt-1">{countdown || "Nta membership"}</p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=Muraho%20ndashaka%20ubufasha`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded hover:bg-[#128C7E] transition"
          >
            <FaWhatsapp /> WhatsApp Support
          </a>
        </div>

        {/* 🔹 Inshuti yacu */}
        <div className="bg-[var(--background)] border rounded-lg shadow p-6 flex flex-col items-center text-center">
          <FaUserFriends size={50} className="mb-3 text-[#008489]" />
          <h2 className="font-semibold text-lg">Inshuti yacu</h2>
          <p className="text-sm mt-1">Hano haza amakuru y’inshuti za community</p>
        </div>

        {/* 🔹 Umujyanama wacu */}
        <div className="bg-[var(--background)] border rounded-lg shadow p-6 flex flex-col items-center text-center">
          <FaUserTie size={50} className="mb-3 text-[#008489]" />
          <h2 className="font-semibold text-lg">Umujyanama wacu</h2>
          <p className="text-sm mt-1">Hano haza amakuru y’abajyanama</p>
        </div>
      </div>
    </div>
  );
};

export default MemberPage;
