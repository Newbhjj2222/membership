// app/member/page.tsx
import { cookies } from "next/headers";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { FaUserFriends, FaUserShield, FaHandsHelping, FaWhatsapp } from "react-icons/fa";

interface Member {
  username: string;
  role: "member" | "advisor" | "sponsor";
  isMember: boolean;
  subscriptionExpiresAt?: { seconds: number };
  badge?: string;
  phone?: string;
}

export default async function MemberPage() {
  // 🔹 Fata cookies muri server component
  const cookieStore = cookies();
  const userCookie = cookieStore.get("user");
  const username = userCookie ? JSON.parse(userCookie.value).name : null;

  if (!username) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <p>Nturi member. Winjira kugirango ubone membership.</p>
      </div>
    );
  }

  // 🔹 Fata members muri Firestore
  const snapshot = await getDocs(collection(db, "members"));
  const allMembers: Member[] = snapshot.docs.map(doc => doc.data() as Member);
  const userMembership = allMembers.find(m => m.username === username);

  if (!userMembership || !userMembership.isMember) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <p>Nturi member cyangwa membership yawe irangiye.</p>
      </div>
    );
  }

  // 🔹 Map roles to icons & colors
  const roleConfig = {
    member: { icon: <FaUserFriends size={24} />, color: "bg-blue-100" },
    advisor: { icon: <FaUserShield size={24} />, color: "bg-green-100" },
    sponsor: { icon: <FaHandsHelping size={24} />, color: "bg-yellow-100" },
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Your memberships in our family</h1>
      <h2 className="text-xl mb-4">Agaciro kawe niko kacu, {username}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 🔹 Card for user role */}
        <div className={`p-6 rounded-xl shadow flex flex-col justify-between ${roleConfig[userMembership.role].color}`}>
          <div className="flex items-center gap-3 mb-4">
            {roleConfig[userMembership.role].icon}
            <h3 className="text-lg font-semibold capitalize">{userMembership.role}</h3>
          </div>
          {userMembership.badge && <p className="mb-2">Badge: {userMembership.badge}</p>}
          <p>Status: {userMembership.isMember ? "Active member" : "Not a member"}</p>
          <p>
            Expires:{" "}
            {userMembership.subscriptionExpiresAt
              ? new Date(userMembership.subscriptionExpiresAt.seconds * 1000).toLocaleDateString()
              : "N/A"}
          </p>
          {userMembership.phone && (
            <a
              href={`https://wa.me/${userMembership.phone}`}
              target="_blank"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              <FaWhatsapp />
              WhatsApp
            </a>
          )}
        </div>

        {/* 🔹 Optional: Advisor card */}
        {userMembership.role !== "advisor" && (
          <div className="p-6 rounded-xl shadow flex flex-col justify-between bg-green-50">
            <div className="flex items-center gap-3 mb-4">
              <FaUserShield size={24} />
              <h3 className="text-lg font-semibold capitalize">Advisor</h3>
            </div>
            <p>Status: Not a member</p>
          </div>
        )}

        {/* 🔹 Optional: Sponsor card */}
        {userMembership.role !== "sponsor" && (
          <div className="p-6 rounded-xl shadow flex flex-col justify-between bg-yellow-50">
            <div className="flex items-center gap-3 mb-4">
              <FaHandsHelping size={24} />
              <h3 className="text-lg font-semibold capitalize">Sponsor</h3>
            </div>
            <p>Status: Not a member</p>
          </div>
        )}
      </div>
    </div>
  );
}
