import { useState } from "react";
import { Link } from "react-router-dom";
import Brand from "../components/Brand";
import AnimatedBg from "../components/AnimatedBg";
import { apiRequest } from "../services/api";

const PUP_DOMAIN = "@iskolarngbayan.pup.edu.ph";

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [status, setStatus] = useState({ error: "", success: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.email.endsWith(PUP_DOMAIN)) {
      setStatus({ error: `Email must end in ${PUP_DOMAIN}`, success: "" });
      return;
    }

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
      await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: form.fullName,
          email: form.email,
          password: form.password,
        }),
      });

      setStatus({ error: "", success: "Account created! You can now log in." });
    } catch (err) {
      setStatus({ error: err.message, success: "" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="authPage" style={{ position: "relative" }}>
      <AnimatedBg />
      <Link to="/" className="brandLink"><Brand /></Link>

      <section className="authCard" style={{ position: "relative", zIndex: 1 }}>
        <h1>Create Account</h1>
        <p>Register with your official PUP email.</p>

        <form onSubmit={handleSubmit} className="authForm">
          {status.error && <p className="formError">{status.error}</p>}
          {status.success && <p className="formSuccess">{status.success}</p>}

          <label>
            Full Name
            <input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
          </label>
          <label>
            PUP Email
            <input
              type="email"
              placeholder={`yourname${PUP_DOMAIN}`}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>
          <label>
            Password
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
            {loading ? "Creating…" : "Create Account"}
          </button>

          <div className="authLinks">
            <Link to="/login">Back to login</Link>
          </div>
        </form>
      </section>
    </main>
  );
}
