// app/member/page.tsx
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { cookies } from "next/headers";
import Countdown from "./Countdown"; // client component
import { FaUserShield, FaWhatsapp } from "react-icons/fa";

type MemberData = {
  phone: string;
  username?: string;
  isMember: boolean;
  subscriptionExpiresAt: { seconds: number; nanoseconds: number };
};

export default async function MemberPage() {
  // 🔹 Fata username muri cookies (SSR)
  const cookieStore = await cookies(); // 🔹 await
  const userCookieValue = cookieStore.get("user")?.value ?? null;
  const username = userCookieValue ? JSON.parse(userCookieValue).name : null;

  // 🔹 Fata data y'umunyamuryango muri Firestore
  let memberData: MemberData | null = null;
  if (username) {
    const ref = doc(db, "members", username);
    const snap = await getDoc(ref);
    if (snap.exists()) memberData = snap.data() as MemberData;
  }

  const isMember = memberData?.isMember ?? false;
  const expiresAt = memberData?.subscriptionExpiresAt
    ? new Date(memberData.subscriptionExpiresAt.seconds * 1000)
    : null;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold mb-6">Your members in our family</h1>

      {username ? (
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaUserShield className="text-green-500" size={24} />
              <span className="font-semibold text-lg">{username}</span>
            </div>
            {isMember && (
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm font-medium">
                Member
              </span>
            )}
          </div>

          {isMember && expiresAt ? (
            <Countdown targetDate={expiresAt} />
          ) : (
            <p className="text-red-500 font-medium">
              You are not a member or your membership has expired.
            </p>
          )}

          <a
            href="https://wa.me/250722319367"
            target="_blank"
            className="flex items-center justify-center gap-2 mt-4 p-3 bg-[#25D366] text-white rounded hover:opacity-90 transition"
          >
            <FaWhatsapp /> Need help? Contact us
          </a>
        </div>
      ) : (
        <p className="text-center text-red-500 font-medium">
          Please login first to see membership info.
        </p>
      )}
    </div>
  );
}
