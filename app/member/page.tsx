// app/member/page.tsx
import React from "react";
import { cookies } from "next/headers";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { FaUserFriends, FaUserTie, FaUserShield } from "react-icons/fa";

interface MemberData {
  username?: string | null;
  isMember?: boolean;
  subscriptionExpiresAt?: { seconds: number; nanoseconds: number }; // Firestore timestamp
}

const MemberPage = async () => {
  // 🔹 Fata username muri cookies safely
  const cookieStore: any = cookies(); // bypass type error
  const userCookieValue = cookieStore.get?.("user")?.value;
  const username = userCookieValue ? JSON.parse(userCookieValue).name : null;

  // 🔹 Fetch user data muri Firestore
  let memberData: MemberData | null = null;
  if (username) {
    const docRef = doc(db, "members", username);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      memberData = docSnap.data() as MemberData;
    }
  }

  // 🔹 Calculate countdown for membership (3 months)
  let countdownText = "Nta membership";
  let remainingDays = 0;

  if (memberData?.isMember && memberData.subscriptionExpiresAt) {
    const expiryDate = new Date(memberData.subscriptionExpiresAt.seconds * 1000);
    const now = new Date();
    remainingDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    countdownText = remainingDays > 0
      ? `${remainingDays} day(s) remaining`
      : "Membership yawe yararangiye";
  }

  return (
    <div className="min-h-screen p-4 bg-[var(--background)] text-[var(--foreground)]">
      <h1 className="text-3xl text-center font-bold mb-8">
        Your members in our family
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* 🔹 Umunyamuryango */}
        <div className="bg-[var(--background)] border rounded-lg shadow p-4 flex flex-col items-center text-center">
          <FaUserShield size={40} className="mb-2 text-[#008489]" />
          <h2 className="font-semibold">Umunyamuryango wacu</h2>
          {memberData?.isMember ? (
            <>
              <p className="text-sm mt-1">{username}</p>
              <p className="text-sm mt-1">{countdownText}</p>
            </>
          ) : (
            <p className="text-sm mt-1 text-red-500">Ntabwo uri umunyamuryango</p>
          )}
        </div>

        {/* 🔹 Inshuti yacu */}
        <div className="bg-[var(--background)] border rounded-lg shadow p-4 flex flex-col items-center text-center">
          <FaUserFriends size={40} className="mb-2 text-[#008489]" />
          <h2 className="font-semibold">Inshuti yacu</h2>
          <p className="text-sm mt-1">Hano haza amakuru y’inshuti za community</p>
        </div>

        {/* 🔹 Umujyanama wacu */}
        <div className="bg-[var(--background)] border rounded-lg shadow p-4 flex flex-col items-center text-center">
          <FaUserTie size={40} className="mb-2 text-[#008489]" />
          <h2 className="font-semibold">Umujyanama wacu</h2>
          <p className="text-sm mt-1">Hano haza amakuru y’abajyanama</p>
        </div>
      </div>
    </div>
  );
};

export default MemberPage;
