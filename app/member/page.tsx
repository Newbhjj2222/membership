// app/member/page.tsx
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { cookies } from "next/headers";
import React from "react";
import { FaUserShield, FaUserFriends, FaUserTie, FaWhatsapp } from "react-icons/fa";

interface MemberData {
  username?: string;
  isMember?: boolean;
  subscriptionExpiresAt?: { seconds: number };
}

export default async function MemberPage() {
  // 🔹 Fata username muri cookies (SSR)
  const cookieStore = cookies();
  const userCookie = cookieStore.get("user");
  const username = userCookie ? JSON.parse(userCookie.value).name : null;

  let memberData: MemberData | null = null;
  if (username) {
    const docRef = doc(db, "members", username);
    const snap = await getDoc(docRef);
    memberData = snap.exists() ? (snap.data() as MemberData) : null;
  }

  const now = Date.now();
  let remainingDays = 0;
  if (memberData?.isMember && memberData.subscriptionExpiresAt) {
    const expireTime = memberData.subscriptionExpiresAt.seconds * 1000;
    remainingDays = Math.max(Math.ceil((expireTime - now) / (1000 * 60 * 60 * 24)), 0);
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Your members in our family</h1>
        <p style={styles.subtitle}>Umunyamuryango wacu, inshuti yacu, umujyanama wacu</p>

        {username ? (
          <div style={styles.memberInfo}>
            <h2>
              <FaUserShield /> {username}{" "}
              {memberData?.isMember && <span style={styles.badge}>MEMBER</span>}
            </h2>
            {memberData?.isMember ? (
              <p>
                Subscription ends in: <strong>{remainingDays} days</strong>
              </p>
            ) : (
              <p>Atakiri umunyamuryango. Subscription ended.</p>
            )}

            <a
              href="https://wa.me/250722319367"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.whatsappBtn}
            >
              <FaWhatsapp /> Need help? Contact us
            </a>
          </div>
        ) : (
          <p>Ntuwinjiye. Please login first.</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "var(--background)",
    color: "var(--foreground)",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 600,
    background: "#fff",
    padding: 30,
    borderRadius: 12,
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    textAlign: "center" as const,
  },
  title: {
    fontSize: "2rem",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: "1.2rem",
    marginBottom: 20,
    color: "#555",
  },
  memberInfo: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 15,
    alignItems: "center",
  },
  badge: {
    background: "#008489",
    color: "#fff",
    borderRadius: 6,
    padding: "2px 8px",
    marginLeft: 10,
    fontSize: "0.8rem",
  },
  whatsappBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "#25D366",
    color: "#fff",
    padding: "10px 15px",
    borderRadius: 8,
    textDecoration: "none",
    marginTop: 10,
  },
};
