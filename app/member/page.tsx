// app/member/page.tsx
import { cookies } from "next/headers";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { FaUserFriends, FaUserShield, FaHandsHelping, FaWhatsapp } from "react-icons/fa";
import Image from "next/image";

interface Member {
  username: string;
  role: "member" | "advisor" | "sponsor";
  isMember: boolean;
  subscriptionExpiresAt?: { seconds: number };
}

export default async function MemberPage() {
  // 🔹 Fata username muri cookies
  const cookieStore = cookies(); 
  const userCookie = cookieStore.get("user")?.value;
  const username = userCookie ? JSON.parse(userCookie).name : null;

  if (!username) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <p>Nturi member. Winjira kugirango ubone.</p>
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

  // 🔹 Role icon mapping
  const roleIcons: Record<Member["role"], JSX.Element> = {
    member: <FaUserFriends size={24} />,
    advisor: <FaUserShield size={24} />,
    sponsor: <FaHandsHelping size={24} />,
  };

  return (
    <div className="min-h-screen p-6 bg-[var(--background)] text-[var(--foreground)]">
      <h1 className="text-2xl font-bold mb-6">Murakaza neza, {username}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 🔹 Card ya user */}
        <div className="bg-white p-6 rounded-xl shadow flex flex-col justify-between">
          <div className="flex items-center gap-4 mb-4">
            {roleIcons[userMembership.role]}
            <h2 className="text-xl font-semibold capitalize">{userMembership.role}</h2>
          </div>

          <p className="mb-2">
            <strong>Username:</strong> {userMembership.username}
          </p>
          <p className="mb-2">
            <strong>Status:</strong> {userMembership.isMember ? "Active Member" : "Expired"}
          </p>
          <p className="mb-4">
            <strong>Expires at:</strong>{" "}
            {userMembership.subscriptionExpiresAt
              ? new Date(userMembership.subscriptionExpiresAt.seconds * 1000).toLocaleDateString()
              : "N/A"}
          </p>

          <a
            href={`https://wa.me/250722319367?text=Hello ${userMembership.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto flex items-center justify-center gap-2 p-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            <FaWhatsapp />
            Contact Support
          </a>
        </div>

        {/* 🔹 Placeholder cards zindi roles (optional) */}
        {["advisor", "sponsor"].map((role) => {
          const member = allMembers.find(m => m.role === role);
          return member ? (
            <div
              key={role}
              className="bg-white p-6 rounded-xl shadow flex flex-col justify-between"
            >
              <div className="flex items-center gap-4 mb-4">
                {roleIcons[member.role]}
                <h2 className="text-xl font-semibold capitalize">{member.role}</h2>
              </div>

              <p className="mb-2">
                <strong>Username:</strong> {member.username}
              </p>
              <p className="mb-2">
                <strong>Status:</strong> {member.isMember ? "Active" : "Expired"}
              </p>
              <p className="mb-4">
                <strong>Expires at:</strong>{" "}
                {member.subscriptionExpiresAt
                  ? new Date(member.subscriptionExpiresAt.seconds * 1000).toLocaleDateString()
                  : "N/A"}
              </p>

              <a
                href={`https://wa.me/250722319367?text=Hello ${member.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto flex items-center justify-center gap-2 p-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                <FaWhatsapp />
                Contact Support
              </a>
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
}
