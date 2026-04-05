// app/member/page.tsx
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { cookies } from "next/headers";
import { FaUserFriends, FaUserShield, FaHandsHelping, FaWhatsapp } from "react-icons/fa";

interface Member {
  username: string;
  role: "member" | "advisor" | "sponsor";
  badge?: string;
  isMember: boolean;
  subscriptionExpiresAt?: { seconds: number };
  whatsapp?: string;
}

export default async function MemberPage() {
  // 🔹 Fata username muri cookies (nta .get())
  const cookieList = cookies();
  const allCookies = cookieList.getAll?.() ?? [];
  const userCookie = allCookies.find((c) => c.name === "user")?.value;
  const username: string | null = userCookie ? JSON.parse(userCookie).name : null;

  if (!username) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
        <p className="text-xl">Nturi member. Winjira kugirango ubone membership.</p>
      </div>
    );
  }

  // 🔹 Fata members muri Firestore
  let members: Member[] = [];
  try {
    const snapshot = await getDocs(collection(db, "members"));
    members = snapshot.docs.map((doc) => doc.data() as Member);
  } catch (err) {
    console.error("Error fetching members:", err);
  }

  // 🔹 Fata member uhwanye na username
  const currentMember = members.find((m) => m.username === username);

  if (!currentMember || !currentMember.isMember) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
        <p className="text-xl">Nturi member. Winjira kugirango ubone membership.</p>
      </div>
    );
  }

  // 🔹 Role cards
  const roles = [
    { role: "member", icon: <FaUserFriends size={24} />, color: "bg-blue-100" },
    { role: "advisor", icon: <FaUserShield size={24} />, color: "bg-green-100" },
    { role: "sponsor", icon: <FaHandsHelping size={24} />, color: "bg-yellow-100" },
  ];

  const userExpiry = currentMember.subscriptionExpiresAt
    ? new Date(currentMember.subscriptionExpiresAt.seconds * 1000).toLocaleDateString()
    : "-";

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Your memberships in our family. Agaciro kawe niko kacu.
      </h1>

      <div className="grid gap-6 md:grid-cols-3">
        {roles.map((roleItem) => {
          if (currentMember.role !== roleItem.role) return null;

          return (
            <div
              key={roleItem.role}
              className={`p-6 rounded-xl shadow flex flex-col justify-between ${roleItem.color}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold capitalize">{roleItem.role}</h2>
                {roleItem.icon}
              </div>
              <p>
                <strong>Username:</strong> {currentMember.username}
              </p>
              {currentMember.badge && (
                <p>
                  <strong>Badge:</strong> {currentMember.badge}
                </p>
              )}
              <p>
                <strong>Status:</strong> {currentMember.isMember ? "Active" : "Expired"}
              </p>
              <p>
                <strong>Expiry:</strong> {userExpiry}
              </p>
              {currentMember.whatsapp && (
                <a
                  href={`https://wa.me/${currentMember.whatsapp}`}
                  target="_blank"
                  className="mt-3 inline-flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  <FaWhatsapp /> WhatsApp
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
