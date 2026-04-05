// app/member/page.tsx
import React from "react";
import { cookies } from "next/headers";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { FaUserFriends, FaUserTie, FaUserShield } from "react-icons/fa";

interface MemberData {
  username?: string | null;
  isMember?: boolean;
  subscriptionExpiresAt?: any; // Firestore timestamp
}

const MemberPage = async () => {
  // 🔹 Fata username muri cookies
  const cookieStore = cookies();
  const userCookie = cookieStore.get("user");
  const username = userCookie ? JSON.parse(userCookie.value).name : null;

  // 🔹 Fetch user data muri Firestore
  let memberData: MemberData | null = null;

  if (username) {
    const docRef = doc(db, "members", username);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      memberData = docSnap.data() as MemberData;
    }
  }

  // 🔹 Calculate countdown
  let countdownText = "Nta membership";
  let remainingDays = 0;

  if (memberData?.isMember && memberData.subscriptionExpiresAt) {
    const expiryDate = new Date(memberData.subscriptionExpiresAt.seconds * 1000);
    const now = new Date();
    remainingDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (remainingDays > 0) {
      countdownText = `${remainingDays} day(s) remaining`;
    } else {
      countdownText = "Membership yawe yararangiye";
    }
  }

  return (
    <div className="min-h-screen p-4 bg-[var(--background)] text-[var(--foreground)]">
      <h1 className="text-3xl text-center font-bold mb-8">Your members in our family</h1>

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
