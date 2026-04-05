// app/member/page.tsx
import React from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { FaUserShield, FaUserFriends, FaHandsHelping, FaWhatsapp } from "react-icons/fa";

type MemberRole = "member" | "advisor" | "sponsor";

interface Member {
  uid: string;
  username: string;
  role: MemberRole;
  isActive: boolean;
  subscriptionExpiresAt?: { seconds: number };
}

export default async function MemberPage() {
  // 🔹 Fetch members data (SSR)
  let members: Member[] = [];
  try {
    const snapshot = await getDocs(collection(db, "members"));
    members = snapshot.docs.map((doc) => doc.data() as Member);
  } catch (err) {
    console.error("SSR fetch members error:", err);
  }

  const roles: { role: MemberRole; icon: JSX.Element; color: string }[] = [
    { role: "member", icon: <FaUserFriends size={24} />, color: "bg-blue-100" },
    { role: "advisor", icon: <FaUserShield size={24} />, color: "bg-green-100" },
    { role: "sponsor", icon: <FaHandsHelping size={24} />, color: "bg-yellow-100" },
  ];

  // 🔹 Helper to render role card
  const renderRoleCard = (role: MemberRole, icon: JSX.Element, color: string) => {
    const filtered = members.filter((m) => m.role === role && m.isActive);
    if (filtered.length === 0) return null;

    return (
      <div className={`rounded-xl shadow p-5 flex flex-col gap-4 ${color}`} key={role}>
        <div className="flex items-center gap-3">
          {icon}
          <h2 className="text-xl font-bold capitalize">{role}</h2>
        </div>
        <div className="flex flex-col gap-2">
          {filtered.map((m) => (
            <div
              key={m.uid}
              className="flex justify-between items-center p-3 bg-white rounded-lg shadow"
            >
              <div>
                <p className="font-semibold">{m.username}</p>
                <span className="text-xs text-gray-500">
                  {role.toUpperCase()}{" "}
                  {m.isActive ? (
                    <span className="px-2 py-1 text-white bg-green-500 rounded-full text-[10px] ml-1">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-white bg-red-500 rounded-full text-[10px] ml-1">
                      EXPIRED
                    </span>
                  )}
                </span>
                <p className="text-xs text-gray-600">
                  Expires:{" "}
                  {m.subscriptionExpiresAt
                    ? new Date(m.subscriptionExpiresAt.seconds * 1000).toLocaleDateString()
                    : "-"}
                </p>
              </div>
              <a
                href="https://wa.me/250722319367"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-500 hover:text-green-600"
                title="Contact on Whatsapp"
              >
                <FaWhatsapp size={20} />
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-5">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Your memberships in our family. Agaciro kawe niko kacu.
      </h1>
      <div className="grid gap-6 md:grid-cols-3">
        {roles.map((r) => renderRoleCard(r.role, r.icon, r.color))}
      </div>
    </div>
  );
}
