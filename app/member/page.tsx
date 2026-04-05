// app/member/page.tsx
import { cookies } from "next/headers"; // Server Component API
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import React from "react";
import { FaUserShield, FaUserFriends, FaUserTie, FaWhatsapp } from "react-icons/fa";

// 🔹 Type y'amakuru ya member
type MemberData = {
  phone: string;
  username: string | null;
  isMember: boolean;
  createdAt: { seconds: number };
  subscriptionExpiresAt: { seconds: number };
};

export default async function MemberPage() {
  // 🔹 Fata cookie yitwa 'user' muri SSR
  const cookieStore = cookies();
  const userCookie = cookieStore.get("user"); 
  const username = userCookie ? JSON.parse(userCookie.value).name : null;

  // 🔹 Fetch member data muri Firestore
  let memberData: MemberData | null = null;
  if (username) {
    const ref = doc(db, "members", username);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      memberData = snap.data() as MemberData;
    }
  }

  // 🔹 Calculate remaining time for membership (seconds)
  let remainingSeconds = 0;
  const now = Date.now();
  if (memberData?.isMember && memberData.subscriptionExpiresAt) {
    remainingSeconds =
      memberData.subscriptionExpiresAt.seconds * 1000 - now;
  }

  // 🔹 Format badge and status
  const isMember = memberData?.isMember && remainingSeconds > 0;
  const badge = isMember ? "Active Member" : "Not a Member";

  return (
    <div style={styles.page}>
      <main style={styles.main}>
        <div style={styles.card}>
          <h1 style={styles.title}>Your members in our family</h1>

          <div style={styles.icons}>
            <FaUserShield size={30} />
            <FaUserFriends size={30} />
            <FaUserTie size={30} />
          </div>

          <div style={styles.info}>
            <p>
              {username
                ? `Muraho, ${username}!`
                : "Nta username yabonetse."}
            </p>
            <p>Status: <strong>{badge}</strong></p>

            {isMember && (
              <p>
                Membership expires in:{" "}
                <span id="countdown">{formatTime(remainingSeconds)}</span>
              </p>
            )}

            {/* 🔹 Whatsapp help button */}
            <a
              href="https://wa.me/250722319367"
              target="_blank"
              style={styles.whatsappButton}
            >
              <FaWhatsapp size={20} style={{ marginRight: 5 }} />
              Get Help
            </a>
          </div>
        </div>
      </main>

      {/* 🔹 Client-side countdown script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
          const countdownElem = document.getElementById('countdown');
          let remaining = ${remainingSeconds};
          if(countdownElem){
            setInterval(()=>{
              if(remaining <=0){
                countdownElem.innerText = 'Membership expired';
                return;
              }
              remaining -=1;
              countdownElem.innerText = formatTime(remaining);
            },1000);

            function formatTime(sec){
              const d = Math.floor(sec/(3600*24));
              const h = Math.floor((sec%(3600*24))/3600);
              const m = Math.floor((sec%3600)/60);
              const s = Math.floor(sec%60);
              return d+'d '+h+'h '+m+'m '+s+'s';
            }
          }
          `,
        }}
      />
    </div>
  );
}

// 🔹 Styles muri file imwe
const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f0f4f8",
    padding: 20,
  },
  main: {
    width: "100%",
    maxWidth: 800,
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: 30,
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 600,
  },
  icons: {
    display: "flex",
    gap: 15,
    marginBottom: 20,
  },
  info: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    alignItems: "center",
  },
  whatsappButton: {
    marginTop: 15,
    display: "flex",
    alignItems: "center",
    background: "#25D366",
    color: "#fff",
    padding: "10px 15px",
    borderRadius: 8,
    textDecoration: "none",
    fontWeight: 500,
  },
};

// 🔹 Helper function for SSR formatting
function formatTime(sec: number) {
  const d = Math.floor(sec / (3600 * 24));
  const h = Math.floor((sec % (3600 * 24)) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}
