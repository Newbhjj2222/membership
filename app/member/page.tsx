// app/member/page.tsx
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { FaUserShield, FaUserFriends, FaUserTie, FaWhatsapp } from "react-icons/fa";

interface Member {
  phone: string;
  username: string;
  role: "member" | "umujyanama" | "umuterankunga";
  createdAt: { seconds: number };
  subscriptionExpiresAt: { seconds: number };
}

export default async function MembersPage() {
  // 🔹 Fetch members muri SSR
  let members: Member[] = [];
  try {
    const membersCol = collection(db, "members");
    const snapshot = await getDocs(membersCol);
    members = snapshot.docs.map((doc) => doc.data() as Member);
  } catch (error) {
    console.error("SSR fetch members error:", error);
  }

  // 🔹 Helper function
  const renderRoleCard = (role: Member["role"], icon: JSX.Element, color: string) => {
    const filtered = members.filter((m) => m.role === role);
    return (
      <div className="bg-white rounded-xl shadow p-5 flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-4">
          <span className={`text-2xl ${color}`}>{icon}</span>
          <h2 className="text-xl font-semibold capitalize">{role}</h2>
        </div>

        {filtered.length === 0 ? (
          <p className="text-gray-500">No {role}s found.</p>
        ) : (
          filtered.map((m) => {
            const now = Date.now();
            const expires = m.subscriptionExpiresAt
              ? m.subscriptionExpiresAt.seconds * 1000
              : 0;
            const isActive = expires > now;
            const remaining = expires - now;
            const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((remaining / (1000 * 60)) % 60);

            return (
              <div key={m.phone} className="border-t border-gray-200 pt-3 mt-3">
                <p className="font-semibold">{m.username || "-"}</p>
                {isActive && <span className="text-green-600 font-semibold text-sm">Active ✅</span>}
                {!isActive && <span className="text-red-500 font-semibold text-sm">Expired ❌</span>}
                {isActive && (
                  <p className="text-gray-600 text-sm">
                    Expires in: {days}d {hours}h {minutes}m
                  </p>
                )}
                <div className="mt-2 flex gap-2">
                  <a
                    href={`https://wa.me/250722319367?text=Muraho! Nkeneye ubufasha ku membership yanjye`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                  >
                    <FaWhatsapp /> Whatsapp
                  </a>
                  <span className="text-sm text-gray-500">Phone: {m.phone}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col items-center p-6 text-[var(--foreground)]">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Your memberships in our family. <br /> Agaciro kawe niko kacu.
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {renderRoleCard("member", <FaUserFriends />, "text-blue-500")}
        {renderRoleCard("umujyanama", <FaUserShield />, "text-yellow-500")}
        {renderRoleCard("umuterankunga", <FaUserTie />, "text-purple-500")}
      </div>
    </main>
  );
}
