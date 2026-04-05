// app/login/page.tsx
'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { setCookie } from "cookies-next";
import Link from "next/link";
import Image from "next/image";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const provider = new GoogleAuthProvider();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  /* =====================
     EMAIL + PASSWORD LOGIN
  ===================== */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      setMessage("Winjiye neza");
      await handleUserFromFirestore(user.email || "");

      router.replace("/");
    } catch (error: any) {
      setMessage("Kwinjira ntibishobotse: " + error.message);
      setLoading(false);
    }
  };

  /* =====================
     GOOGLE LOGIN
  ===================== */
  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage("");

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      setMessage("Winjiye neza ukoresheje Google..");
      await saveGoogleUser(user);

      // 🔹 Save in cookies
      setCookie("user", JSON.stringify({
        uid: user.uid,
        name: user.displayName,
        email: user.email,
      }), { maxAge: 60 * 60 * 24 });

      router.replace("/");
    } catch (error: any) {
      setMessage("Google login ntibishobotse: " + error.message);
      setLoading(false);
    }
  };

  /* =====================
     RESET PASSWORD
  ===================== */
  const handleResetPassword = async () => {
    if (!email) {
      setMessage("Andika email yawe mbere yo gusaba reset password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Email yo guhindura password yoherejwe. Reba email yawe.");
    } catch (error: any) {
      setMessage("Reset ntibishobotse: " + error.message);
    }
  };

  /* =====================
     FIRESTORE HELPERS
  ===================== */
  const handleUserFromFirestore = async (email: string) => {
    const ref = doc(db, "userdate", "data");
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const data = snap.data();
    for (const key in data) {
      if (data[key].email === email) {
        setCookie("user", JSON.stringify({
          name: data[key].fName || "User",
          email: data[key].email,
        }), { maxAge: 60 * 60 * 24 });
        break;
      }
    }
  };

  const saveGoogleUser = async (user: any) => {
    const ref = doc(db, "userdate", "data");
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : {};

    if (!data[user.uid]) {
      await setDoc(ref, {
        ...data,
        [user.uid]: {
          fName: user.displayName,
          email: user.email,
          provider: "google",
        },
      });
    }
  };

  return (
    <div style={styles.container}>
      {loading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.spinner}></div>
          <p>Tegereza gato...</p>
        </div>
      )}

      <div style={styles.box}>
        <h2 style={styles.title}>Sign In</h2>

        {message && <div style={styles.messageDiv}>{message}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.btn}>Sign In</button>
          <button type="button" style={styles.resetBtn} onClick={handleResetPassword}>
            Forgot password?
          </button>
          <button type="button" style={styles.googleBtn} onClick={handleGoogleLogin}>
            <Image src="/google.svg" alt="Google" width={20} height={20}/>
            <span>Continue with Google</span>
          </button>
        </form>

        <p style={styles.registerLink}>
          Nta konti ufite? <Link href="/register">Iyandikishe hano</Link>
        </p>
      </div>
    </div>
  );
};

/* ===================== CSS IN JS ===================== */
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem',
    background: '#f5f5f5',
  },
  box: {
    width: '100%',
    maxWidth: '400px',
    padding: '2rem',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  },
  title: { textAlign: 'center', marginBottom: '1rem' },
  messageDiv: { marginBottom: '1rem', color: 'red', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  input: {
    padding: '0.75rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '1rem',
  },
  btn: {
    padding: '0.75rem',
    background: '#008489',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  resetBtn: {
    background: 'transparent',
    border: 'none',
    color: '#008489',
    cursor: 'pointer',
    fontSize: '0.9rem',
    textAlign: 'right',
  },
  googleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    background: '#fff',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '0.5rem',
    fontSize: '1rem',
  },
  registerLink: { textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' },
  loadingOverlay: {
    position: 'fixed',
    top:0, left:0, right:0, bottom:0,
    display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center',
    background:'rgba(0,0,0,0.3)',
    zIndex: 1000
  },
  spinner: {
    width: '40px', height:'40px', border:'4px solid #f3f3f3',
    borderTop: '4px solid #008489',
    borderRadius:'50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem'
  },
};

/* ===================== SPINNER ANIMATION ===================== */
if (typeof window !== 'undefined') {
  const styleSheet = document.styleSheets[0];
  styleSheet.insertRule(`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`, styleSheet.cssRules.length);
}

export default LoginPage;
