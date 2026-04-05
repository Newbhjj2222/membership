// app/member/page.tsx
import { cookies } from "next/headers";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { FaUserFriends, FaUserShield, FaHandsHelping, FaWhatsapp } from "react-icons/fa";
import Link from "next/link";

interface Member {
  username: string;
  role: "member" | "advisor" | "sponsor";
  subscriptionExpiresAt: { seconds: number } | null;
}

export default async function MemberPage() {
  // 🔹 Fata username muri cookies (SSR)
  const cookieStore = await cookies();
  const userCookie = cookieStore.get?.("user")?.value;
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

  const roles = [
    { role: "member", label: "Member", icon: <FaUserFriends size={24} />, color: "bg-blue-100" },
    { role: "advisor", label: "Advisor", icon: <FaUserShield size={24} />, color: "bg-green-100" },
    { role: "sponsor", label: "Sponsor", icon: <FaHandsHelping size={24} />, color: "bg-yellow-100" },
  ];

  const renderRoleCard = (role: string) => {
    const filtered = allMembers.filter((m) => m.role === role);
    if (filtered.length === 0) return null;

    const member = filtered[0];
    const expired =
      !member.subscriptionExpiresAt ||
      member.subscriptionExpiresAt.seconds * 1000 < Date.now();

    return (
      <div className={`rounded-xl shadow p-5 flex flex-col justify-between ${roles.find(r => r.role === role)?.color}`}>
        <div className="flex items-center gap-3 mb-3">
          {roles.find(r => r.role === role)?.icon}
          <h2 className="text-xl font-semibold">{roles.find(r => r.role === role)?.label}</h2>
        </div>
        <p className="mb-2">
          <strong>Username:</strong> {member.username}
        </p>
        <p className="mb-2">
          <strong>Status:</strong> {expired ? "Not a member" : "Active"}
        </p>
        <p className="mb-4">
          <strong>Expires At:</strong>{" "}
          {member.subscriptionExpiresAt
            ? new Date(member.subscriptionExpiresAt.seconds * 1000).toLocaleDateString()
            : "-"}
        </p>
        <Link
          href={`https://wa.me/250722319367?text=Hello ${member.username}, I need support.`}
          target="_blank"
          className="flex items-center justify-center gap-2 p-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          <FaWhatsapp />
          Contact WhatsApp
        </Link>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-[var(--background)] text-[var(--foreground)]">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Your memberships in our family. Agaciro kawe niko kacu.
      </h1>

      {username ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((r) => renderRoleCard(r.role))}
        </div>
      ) : (
        <p className="text-center text-red-500">
          You are not logged in. Please login first.
        </p>
      )}
    </div>
  );
}
