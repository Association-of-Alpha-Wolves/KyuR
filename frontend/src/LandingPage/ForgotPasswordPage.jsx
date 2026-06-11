import { useState } from "react";
import { Link } from "react-router-dom";
import Brand from "../components/Brand";
import { apiRequest } from "../services/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ error: "", success: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim()) {
      setStatus({ error: "Please enter your email.", success: "" });
      return;
    }

    setLoading(true);
    setStatus({ error: "", success: "" });

    try {
      await apiRequest("/api/auth/forgotpassword", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      setStatus({
        error: "",
        success: "If an account exists, a reset link has been sent.",
      });
    } catch (err) {
      setStatus({ error: err.message, success: "" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="authPage">
      <Link to="/" className="brandLink"><Brand /></Link>

      <section className="authCard">
        <h1>Forgot Password</h1>
        <p>Enter your PUP email and we’ll send a reset link.</p>

        <form onSubmit={handleSubmit} className="authForm">
          {status.error && <p className="formError">{status.error}</p>}
          {status.success && <p className="formSuccess">{status.success}</p>}

          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          <button className="primaryBtn fullBtn" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <div className="authLinks">
            <Link to="/login">Back to login</Link>
          </div>
        </form>
      </section>
    </main>
  );
}