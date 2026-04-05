// app/member/page.tsx
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

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

  // 🔹 Generate HTML
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">Memberships</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {members.length === 0 && <p className="col-span-full text-center">No members found.</p>}

        {members.map((m) => {
          const now = Date.now();
          const expires = m.subscriptionExpiresAt
            ? m.subscriptionExpiresAt.seconds * 1000
            : 0;
          const isActiveMember = expires > now;

          // 🔹 Countdown calculation
          const remaining = expires - now;
          const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
          const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((remaining / (1000 * 60)) % 60);

          return (
            <div
              key={m.phone}
              className="bg-white rounded-xl shadow p-5 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-xl font-semibold">{m.username || "-"}</h2>
                <p className="text-gray-500">{m.phone}</p>

                <p className="mt-2">
                  Role:{" "}
                  <span className="font-bold capitalize">
                    {m.role}
                  </span>
                </p>

                {isActiveMember && (
                  <p className="mt-2 text-green-600 font-semibold">
                    Active Member ✅
                  </p>
                )}

                {expires && isActiveMember && (
                  <p className="mt-2 text-sm text-gray-700">
                    Membership expires in: {days}d {hours}h {minutes}m
                  </p>
                )}
              </div>

              <div className="mt-4 flex justify-between items-center">
                <a
                  href={`https://wa.me/250722319367?text=Muraho! Nkeneye ubufasha ku membership yanjye`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                  <span>Whatsapp</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0C5.371 0 0 5.371 0 12c0 2.121.555 4.108 1.517 5.829L0 24l6.281-1.495C7.924 23.445 9.933 24 12 24c6.629 0 12-5.371 12-12S18.629 0 12 0zm6.404 17.131c-.26.725-1.51 1.356-2.08 1.444-.554.087-1.227.123-4.171-1.186-3.6-1.547-5.895-5.432-6.078-5.652-.182-.221-1.487-1.889-1.487-3.612 0-1.723.915-2.574 1.24-2.925.325-.351.715-.44.953-.44.239 0 .476.003.685.005.222.003.519-.084.814.616.297.7 1.011 2.427 1.099 2.605.087.182.146.397.03.637-.116.24-.171.382-.328.595-.156.213-.334.474-.477.637-.144.163-.293.347-.146.675.146.326.647 1.07 1.39 1.729.958.835 1.756 1.102 2.101 1.225.346.123.548.104.75-.062.201-.165.817-.955 1.016-1.287.201-.33.402-.276.669-.166.267.109 1.682.794 1.973.936.291.144.486.216.559.336.074.121.074.699-.186 1.425z" />
                  </svg>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
