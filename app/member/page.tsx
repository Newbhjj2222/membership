// app/member/page.tsx
import { cookies } from "next/headers";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { FaUserFriends, FaUserShield, FaHandsHelping, FaWhatsapp } from "react-icons/fa";

interface Member {
  username: string;
  role: "member" | "advisor" | "sponsor";
  badge?: string;
  isMember: boolean;
  subscriptionExpiresAt?: { seconds: number };
}

export default async function MemberPage() {
  const cookieStore = cookies();
  const userCookie = cookieStore.get("user")?.value;
  const username = userCookie ? JSON.parse(userCookie).name : null;

  if (!username) {
    return <div className="p-8 text-center">Ntacyo wabonye muri cookies. Winjire mbere.</div>;
  }

  // 🔹 Fetch member from Firestore
  let members: Member[] = [];
  try {
    const membersCol = collection(db, "members");
    const q = query(membersCol, where("username", "==", username));
    const snapshot = await getDocs(q);
    members = snapshot.docs.map((doc) => doc.data() as Member);
  } catch (error) {
    console.error("Error fetching members:", error);
  }

  if (members.length === 0) {
    return <div className="p-8 text-center">Ntacyo wabonye. Nturi member.</div>;
  }

  // 🔹 Render cards
  const roleIcons: Record<string, JSX.Element> = {
    member: <FaUserFriends size={24} className="text-blue-600" />,
    advisor: <FaUserShield size={24} className="text-green-600" />,
    sponsor: <FaHandsHelping size={24} className="text-yellow-600" />,
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Your memberships in our family. Agaciro kawe niko kacu.
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {members.map((m) => {
          const expiry = m.subscriptionExpiresAt
            ? new Date(m.subscriptionExpiresAt.seconds * 1000)
            : null;
          const isActive = m.isMember && expiry ? expiry > new Date() : false;

          return (
            <div
              key={m.username + m.role}
              className="bg-white rounded-xl shadow p-6 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {roleIcons[m.role]}
                  <h2 className="text-xl font-semibold">{m.username}</h2>
                </div>
                {m.badge && (
                  <span className="bg-purple-200 text-purple-800 px-2 py-1 rounded-full text-sm">
                    {m.badge}
                  </span>
                )}
              </div>
              <p className="mb-2">
                Status:{" "}
                <span className={isActive ? "text-green-600" : "text-red-600"}>
                  {isActive ? "Active Member" : "Membership Expired"}
                </span>
              </p>
              {expiry && (
                <p className="mb-2">
                  Expires At: {expiry.toLocaleDateString()}
                </p>
              )}
              <a
                href={`https://wa.me/+250722319367?text=Hello ${m.username}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 justify-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
              >
                <FaWhatsapp /> Contact via WhatsApp
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
