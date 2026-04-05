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
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--background)] text-[var(--foreground)]">
      {loading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/30 z-50">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-4 border-t-[#008489] rounded-full animate-spin mb-4"></div>
          <p>Tegereza gato...</p>
        </div>
      )}

      <div className="w-full max-w-md p-8 bg-[var(--background)] rounded-lg shadow-md">
        <h2 className="text-center text-2xl mb-4 font-semibold">Sign In</h2>

        {message && <div className="mb-4 text-red-500 text-center">{message}</div>}

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#008489]"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#008489]"
          />
          <button
            type="submit"
            className="p-3 bg-[#008489] text-white rounded hover:bg-[#00675f] transition"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={handleResetPassword}
            className="text-[#008489] text-sm text-right hover:underline"
          >
            Forgot password?
          </button>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-2 p-3 border border-gray-300 rounded hover:bg-gray-100 transition mt-2"
          >
            <Image src="/google.svg" alt="Google" width={20} height={20} />
            <span>Continue with Google</span>
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Nta konti ufite? <Link href="/register" className="text-[#008489] hover:underline">Iyandikishe hano</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
