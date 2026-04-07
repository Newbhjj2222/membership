import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FaUser, FaEnvelope, FaSignOutAlt } from "react-icons/fa";

export default function ProfilePage() {
  const cookieStore = cookies();
  const userCookie = cookieStore.get("user");

  if (!userCookie) {
    redirect("/login");
  }

  let user: any = null;

  try {
    user = JSON.parse(userCookie.value);
  } catch {
    redirect("/login");
  }

  async function logout() {
    "use server";
    const cookieStore = cookies();
    cookieStore.delete("user");
    redirect("/login");
  }

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Profile</h1>

        <div className="info">
          <div className="row">
            <FaUser className="icon" />
            <span>{user.name || "No Name"}</span>
          </div>

          <div className="row">
            <FaEnvelope className="icon" />
            <span>{user.email}</span>
          </div>
        </div>

        <form action={logout}>
          <button className="logout">
            <FaSignOutAlt />
            Logout
          </button>
        </form>
      </div>

      {/* CSS INSIDE SAME FILE */}
      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: var(--background);
        }

        .card {
          width: 100%;
          max-width: 400px;
          padding: 30px;
          border-radius: 12px;
          background: var(--background);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          text-align: center;
        }

        .title {
          font-size: 24px;
          margin-bottom: 20px;
        }

        .info {
          margin-bottom: 25px;
        }

        .row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border-radius: 8px;
          background: #f5f5f5;
          margin-bottom: 10px;
          font-size: 14px;
        }

        .icon {
          color: #008489;
        }

        .logout {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 8px;
          background: #008489;
          color: white;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: 0.3s;
        }

        .logout:hover {
          background: #00675f;
        }

        /* RESPONSIVE */
        @media (max-width: 480px) {
          .card {
            padding: 20px;
          }

          .title {
            font-size: 20px;
          }

          .row {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}
