import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Brand from "../components/Brand";
import AnimatedBg from "../components/AnimatedBg";
import { apiRequest } from "../services/api";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [status, setStatus] = useState({ error: "", success: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (form.password.length < 6) {
      setStatus({ error: "Password must be at least 6 characters.", success: "" });
      return;
    }

    if (form.password !== form.confirmPassword) {
      setStatus({ error: "Passwords do not match.", success: "" });
      return;
    }

    setLoading(true);
    setStatus({ error: "", success: "" });

    try {
      await apiRequest(`/api/auth/resetpassword/${token}`, {
        method: "PUT",
        body: JSON.stringify({ password: form.password }),
      });

      setStatus({ error: "", success: "Password reset! Redirecting to login…" });
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setStatus({ error: err.message || "Invalid or expired token.", success: "" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="authPage" style={{ position: "relative" }}>
      <AnimatedBg />
      <Link to="/" className="brandLink"><Brand /></Link>

      <section className="authCard" style={{ position: "relative", zIndex: 1 }}>
        <h1>Reset Password</h1>
        <p>Create a new password for your KyuR account.</p>

        <form onSubmit={handleSubmit} className="authForm">
          {status.error && <p className="formError">{status.error}</p>}
          {status.success && <p className="formSuccess">{status.success}</p>}

          <label>
            New Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </label>
          <label>
            Confirm Password
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
          </label>

          <button className="primaryBtn fullBtn" disabled={loading}>
            {loading ? "Resetting…" : "Reset Password"}
          </button>

          <div className="authLinks">
            <Link to="/login">Back to login</Link>
          </div>
        </form>
      </section>
    </main>
  );
}
