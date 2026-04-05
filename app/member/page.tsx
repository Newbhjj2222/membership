// app/member/page.tsx
import { cookies } from "next/headers";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import React from "react";
import dynamic from "next/dynamic";
import { FaUserFriends, FaUserShield, FaHandsHelping, FaWhatsapp } from "react-icons/fa";

// 🔹 Dynamically load Client Component to use hooks
const MemberPageClient = dynamic(() => import("./MemberPageClient"), { ssr: false });

interface Member {
  username: string;
  role: "member" | "advisor" | "sponsor";
  isMember: boolean;
  subscriptionExpiresAt: { seconds: number };
}

export default async function MemberPage() {
  // 🔹 SSR: Fata username muri cookies
  const cookieStore = cookies();
  const userCookie = cookieStore.get("user")?.value;
  const username = userCookie ? JSON.parse(userCookie).name : null;

  if (!username) {
    return <p className="p-6 text-red-500">You must be logged in to see your memberships.</p>;
  }

  // 🔹 SSR: Fata members zose muri database
  let members: Member[] = [];
  try {
    const snapshot = await getDocs(collection(db, "members"));
    members = snapshot.docs.map((doc) => doc.data() as Member);
  } catch (error) {
    console.error("SSR fetch members error:", error);
  }

  // 🔹 Filter only logged-in user's memberships
  const userMembers = members.filter((m) => m.username === username);

  return <MemberPageClient members={userMembers} />;
}
