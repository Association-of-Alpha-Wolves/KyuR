import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Brand from "../components/Brand";
import AnimatedBg from "../components/AnimatedBg";
import { apiRequest } from "../services/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });

      if (data.data?.token) localStorage.setItem("kyurToken", data.data.token);
      navigate("/items");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Login using your PUP email">
      <form onSubmit={handleSubmit} className="authForm">
        {error && <p className="formError">{error}</p>}

        <label>
          Email
          <input
            type="email"
            placeholder="yourname@iskolarngbayan.pup.edu.ph"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>

        <label>
          Password
          <div className="passwordField">
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>

        <button className="primaryBtn fullBtn" disabled={loading}>
          {loading ? "Logging in…" : "Login"}
        </button>

        <div className="authLinks">
          <Link to="/register">Create account</Link>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
      </form>
    </AuthShell>
  );
}

function AuthShell({ title, subtitle, children }) {
  return (
    <main className="authPage" style={{ position: "relative" }}>
      <AnimatedBg />
      <Link to="/" className="brandLink"><Brand /></Link>
      <section className="authCard" style={{ position: "relative", zIndex: 1 }}>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {children}
      </section>
    </main>
  );
}
