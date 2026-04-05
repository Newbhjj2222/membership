// app/member/page.tsx
import { cookies } from "next/headers";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import { FaUserFriends, FaUserShield, FaHandsHelping, FaWhatsapp } from "react-icons/fa";

interface Member {
  username: string;
  role: "member" | "advisor" | "sponsor";
  subscriptionExpiresAt?: { seconds: number };
}

export default async function MemberPage() {
  // 🔹 Fata username muri cookies
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const username = userCookie ? JSON.parse(userCookie).name : null;

  // 🔹 Fetch members
  let allMembers: Member[] = [];
  if (username) {
    try {
      const snapshot = await getDocs(collection(db, "members"));
      allMembers = snapshot.docs.map((doc) => doc.data() as Member);
    } catch (err) {
      console.error("Failed to fetch members:", err);
    }
  }

  // 🔹 Helper function yerekana cards ziriho username
  const renderRoleCard = (role: Member["role"], icon: React.ReactNode, color: string) => {
    const filtered = allMembers.filter(
      (m) => m.username === username && m.role === role
    );

    if (filtered.length === 0) return null;

    const member = filtered[0];
    const isActive =
      member.subscriptionExpiresAt &&
      member.subscriptionExpiresAt.seconds * 1000 > Date.now();

    return (
      <div className={`${color} rounded-xl shadow p-5 flex flex-col justify-between w-full max-w-sm`}>
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <h3 className="font-semibold">{member.username}</h3>
            <span className="text-sm bg-green-200 px-2 py-1 rounded">
              {role.toUpperCase()}
            </span>
          </div>
        </div>
        <p className="mt-3 text-sm">
          Status: {isActive ? "Active" : "Expired"}
        </p>
        {member.subscriptionExpiresAt && (
          <p className="text-xs text-gray-500">
            Expires at: {new Date(member.subscriptionExpiresAt.seconds * 1000).toLocaleDateString()}
          </p>
        )}
        <Link
          href="https://wa.me/250722319367"
          target="_blank"
          className="mt-3 inline-flex items-center gap-2 bg-[#25D366] text-white px-3 py-2 rounded hover:bg-green-600"
        >
          <FaWhatsapp /> Contact us
        </Link>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-5 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-5 text-center">
        Your memberships in our family. Agaciro kawe niko kacu.
      </h1>
      <div className="flex flex-col md:flex-row gap-5">
        {renderRoleCard("member", <FaUserFriends size={24} />, "bg-blue-100")}
        {renderRoleCard("advisor", <FaUserShield size={24} />, "bg-green-100")}
        {renderRoleCard("sponsor", <FaHandsHelping size={24} />, "bg-yellow-100")}
      </div>
      {!username && <p className="mt-5 text-red-500">You are not logged in.</p>}
      {username && allMembers.filter(m => m.username === username).length === 0 && (
        <p className="mt-5 text-red-500">You are not a member or your membership has expired.</p>
      )}
    </div>
  );
}
