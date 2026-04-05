// app/member/page.tsx
import { cookies } from "next/headers";
import Link from "next/link";
import { FaUserFriends, FaUserShield, FaHandsHelping, FaWhatsapp } from "react-icons/fa";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

// 🔹 Types
interface Member {
  username: string;
  role: "member" | "advisor" | "sponsor";
  isMember: boolean;
  subscriptionExpiresAt: { seconds: number };
}

interface RoleCard {
  role: "member" | "advisor" | "sponsor";
  icon: JSX.Element;
  color: string;
}

// 🔹 Page (Server Component)
export default async function MemberPage() {
  // 🔹 Fata username muri cookies
  const cookieStore = cookies();
  const userCookie = cookieStore.get("user")?.value;
  const username = userCookie ? JSON.parse(userCookie).name : null;

  let allMembers: Member[] = [];
  if (username) {
    try {
      const snapshot = await getDocs(collection(db, "members"));
      allMembers = snapshot.docs
        .map((doc) => doc.data() as Member)
        .filter((m) => m.username === username);
    } catch (err) {
      console.error("Failed to fetch members:", err);
    }
  }

  // 🔹 Check expiration
  const now = Date.now();
  const membersWithStatus = allMembers.map((m) => {
    const expires = m.subscriptionExpiresAt?.seconds ? m.subscriptionExpiresAt.seconds * 1000 : 0;
    const isActive = expires > now;
    return { ...m, isMember: isActive };
  });

  const roles: RoleCard[] = [
    { role: "member", icon: <FaUserFriends size={24} />, color: "bg-blue-100" },
    { role: "advisor", icon: <FaUserShield size={24} />, color: "bg-green-100" },
    { role: "sponsor", icon: <FaHandsHelping size={24} />, color: "bg-yellow-100" },
  ];

  return (
    <div className="min-h-screen p-6 bg-[var(--background)] text-[var(--foreground)] font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Your memberships in our family. Agaciro kawe niko kacu.
      </h1>

      {!username && (
        <p className="text-center text-red-500">You must be logged in to see memberships.</p>
      )}

      {username && membersWithStatus.length === 0 && (
        <p className="text-center text-red-500">
          You are not a member yet or your membership has expired.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map(({ role, icon, color }) => {
          const filtered = membersWithStatus.filter((m) => m.role === role);
          return (
            <div key={role} className={`p-6 rounded-xl shadow ${color}`}>
              <div className="flex items-center gap-3 mb-4">
                {icon}
                <h2 className="text-xl font-semibold capitalize">{role}</h2>
              </div>
              {filtered.length === 0 && <p className="italic">You have no {role} role or it's expired.</p>}
              {filtered.map((m) => (
                <div key={m.username} className="border-t border-gray-300 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{m.username}</span>
                    <span className="px-2 py-1 rounded-full bg-gray-200 text-sm">
                      {m.isMember ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm mt-1">
                    Expires at:{" "}
                    {m.subscriptionExpiresAt?.seconds
                      ? new Date(m.subscriptionExpiresAt.seconds * 1000).toLocaleDateString()
                      : "-"}
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
