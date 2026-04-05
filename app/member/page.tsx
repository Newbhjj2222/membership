// app/member/page.tsx
import { cookies } from "next/headers";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import React from "react";
import { FaUserShield, FaUserFriends, FaWhatsapp } from "react-icons/fa";

interface MemberData {
  username: string;
  isMember: boolean;
  subscriptionExpiresAt: { seconds: number } | null;
}

export default async function MemberPage() {
  const cookieStore = cookies();
  const userCookieValue = cookieStore.get("user")?.value;
  const username = userCookieValue ? JSON.parse(userCookieValue).name : null;

  let memberData: MemberData | null = null;
  if (username) {
    const docRef = doc(db, "members", username);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      memberData = snap.data() as MemberData;
    }
  }

  let countdown = "";
  const now = new Date();
  if (memberData?.isMember && memberData.subscriptionExpiresAt) {
    const expires = new Date(memberData.subscriptionExpiresAt.seconds * 1000);
    if (expires > now) {
      const diff = expires.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      countdown = `${days}d ${hours}h ${minutes}m`;
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] text-[var(--foreground)] p-4">
      <h1 className="text-3xl font-bold mb-6 text-center sm:text-2xl">
        Your members in our family
      </h1>

      {username ? (
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-lg">
            <FaUserFriends className="text-green-600" /> {username}
            {memberData?.isMember && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1">
                <FaUserShield /> Member
              </span>
            )}
          </div>

          <p className="text-center">
            {memberData?.isMember
              ? countdown
                ? `Membership expires in: ${countdown}`
                : "Membership expired"
              : "You are not a member"}
          </p>

          <a
            href="https://wa.me/250722319367"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 px-4 py-2 bg-[#25D366] text-white rounded flex items-center gap-2 hover:bg-green-700 transition"
          >
            <FaWhatsapp /> Contact Support
          </a>
        </div>
      ) : (
        <p className="text-center">No user info found in cookies.</p>
      )}
    </div>
  );
}
