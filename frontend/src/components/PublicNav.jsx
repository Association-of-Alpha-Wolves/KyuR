import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, MessageCircle, User } from "lucide-react";
import Brand from "./Brand.jsx";
import ScrollProgress from "./ScrollProgress.jsx";
import NavChatDropdown from "./NavChatDropdown.jsx";

export default function PublicNav({ showScrollProgress = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const showChatBubble = location.pathname.startsWith("/items") || location.pathname.startsWith("/profile");
  // TEMPORARY: Bypass auth for frontend-only development
  const isLoggedIn = true; // !!localStorage.getItem("kyurToken");
  const handleLogout = () => {
    localStorage.removeItem("kyurToken");
    navigate("/login");
  };

  return (
    <header className="kyurNav" style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <Link to="/" className="brandLink" style={{ flexShrink: 0, marginRight: 8 }}>
        <Brand />
      </Link>

      <nav className="navLinks" style={{ justifyContent: "flex-start", marginRight: "auto" }}>
        <a href="#home">Home</a>
        <a href="#why-choose-kyur">How It Works</a>
        <a href="#about">About</a>
        <Link to="/items">Hall of Lost and Founds</Link>
      </nav>

      {isLoggedIn ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/items/report" className="reportBtn">
            Report Lost Item
          </Link>
          
          {showChatBubble ? (
            <NavChatDropdown />
          ) : (
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500 }}>
              <User size={18} />
              <span>Profile</span>
            </Link>
          )}

          <button onClick={handleLogout} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '8px', minWidth: '40px', minHeight: '40px' }} title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      ) : (
        <Link to="/login" className="reportBtn">
          Report Lost Item
        </Link>
      )}

      {showScrollProgress && <ScrollProgress />}
    </header>
  );
}
