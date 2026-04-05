// app/member/page.tsx
import { cookies } from "next/headers";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import { FaUserFriends, FaUserShield, FaHandsHelping, FaWhatsapp } from "react-icons/fa";

interface Member {
  username: string;
  role: "member" | "advisor" | "sponsor";
  isMember: boolean;
  subscriptionExpiresAt?: { seconds: number };
  phone?: string;
  badge?: string;
}

// 🔹 Server Component
export default async function MemberPage() {
  const cookieStore = cookies();
  const userCookie = cookieStore.get("user")?.value;
  const username = userCookie ? JSON.parse(userCookie).name : null;

  if (!username) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Nta cookie ya user ibonetse</h1>
          <p>Winjire kugirango ubone membership yawe.</p>
          <Link href="/" className="text-blue-600 underline mt-4 block">Subira ku home</Link>
        </div>
      </div>
    );
  }

  // 🔹 Fetch members muri Firestore
  let userMembership: Member | null = null;
  try {
    const snapshot = await getDocs(collection(db, "members"));
    const members = snapshot.docs.map(doc => doc.data() as Member);
    userMembership = members.find(m => m.username === username) || null;
  } catch (error) {
    console.error("Error fetching members:", error);
  }

  if (!userMembership) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Ntabwo uri member</h1>
          <p>Reba niba waraguze membership cyangwa winjire neza.</p>
          <Link href="/" className="text-blue-600 underline mt-4 block">Subira ku home</Link>
        </div>
      </div>
    );
  }

  const roleIcon = {
    member: <FaUserFriends size={24} />,
    advisor: <FaUserShield size={24} />,
    sponsor: <FaHandsHelping size={24} />,
  };

  const roleColor = {
    member: "bg-blue-100",
    advisor: "bg-green-100",
    sponsor: "bg-yellow-100",
  };

  const subscriptionDate = userMembership.subscriptionExpiresAt
    ? new Date(userMembership.subscriptionExpiresAt.seconds * 1000).toLocaleDateString()
    : "N/A";

  return (
    <div className="min-h-screen p-4 bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-center">Your membership in our family</h1>
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-xl shadow ${roleColor[userMembership.role]}`}>
          <div className="flex items-center gap-3 mb-4">
            {roleIcon[userMembership.role]}
            <h2 className="text-xl font-semibold">{userMembership.username}</h2>
          </div>
          {userMembership.badge && (
            <span className="inline-block bg-gray-200 text-gray-800 px-2 py-1 rounded mb-2">{userMembership.badge}</span>
          )}
          <p>Status: {userMembership.isMember ? "Active" : "Inactive"}</p>
          <p>Role: {userMembership.role}</p>
          <p>Expires: {subscriptionDate}</p>
          {userMembership.phone && (
            <Link
              href={`https://wa.me/${userMembership.phone}`}
              target="_blank"
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              <FaWhatsapp />
              WhatsApp
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
