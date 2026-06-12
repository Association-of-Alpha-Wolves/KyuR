import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, User, Menu, X } from "lucide-react";
import Brand from "./Brand.jsx";
import ScrollProgress from "./ScrollProgress.jsx";
import NavChatDropdown from "./NavChatDropdown.jsx";

export default function PublicNav({ showScrollProgress = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const showChatBubble = location.pathname.startsWith("/items") || location.pathname.startsWith("/profile");
  const isLoggedIn = !!localStorage.getItem("kyurToken");

  const handleLogout = () => {
    localStorage.removeItem("kyurToken");
    navigate("/login");
    setMobileOpen(false);
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <header className="kyurNav" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Link to="/" className="brandLink" style={{ flexShrink: 0, marginRight: 8 }} onClick={closeMobile}>
          <Brand />
        </Link>

        <nav className="navLinks" style={{ justifyContent: "flex-start", marginRight: "auto" }}>
          <a href="#home">Home</a>
          <a href="#why-choose-kyur">How It Works</a>
          <a href="#about">About</a>
          <Link to="/items">Hall of Lost and Founds</Link>
        </nav>

        <div className="navActions">
          {isLoggedIn ? (
            <>
              <Link to="/items/report" className="reportBtn">Report Lost Item</Link>
              {showChatBubble ? (
                <NavChatDropdown />
              ) : (
                <Link to="/profile" className="btn-secondary navIconBtn" title="Profile">
                  <User size={20} />
                </Link>
              )}
              <button onClick={handleLogout} className="btn-secondary navIconBtn" title="Logout">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="reportBtn">Report Lost Item</Link>
              <Link to="/login" className="btn-secondary navTextBtn">Log In</Link>
            </>
          )}
        </div>

        <button
          className="nav-hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {mobileOpen && (
        <div className="mobile-nav-overlay" onClick={closeMobile}>
          <nav className="mobile-nav-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-nav-links">
              <a href="#home" onClick={closeMobile}>Home</a>
              <a href="#why-choose-kyur" onClick={closeMobile}>How It Works</a>
              <a href="#about" onClick={closeMobile}>About</a>
              <Link to="/items" onClick={closeMobile}>Hall of Lost and Founds</Link>
            </div>
            <hr className="mobile-nav-divider" />
            <div className="mobile-nav-actions">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/items/report"
                    className="reportBtn mobile-full-btn"
                    onClick={closeMobile}
                  >
                    Report Lost Item
                  </Link>
                  <Link
                    to="/profile"
                    className="btn-secondary mobile-full-btn"
                    style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                    onClick={closeMobile}
                  >
                    <User size={18} /> Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="btn-secondary mobile-full-btn"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="reportBtn mobile-full-btn"
                    onClick={closeMobile}
                  >
                    Report Lost Item
                  </Link>
                  <Link
                    to="/login"
                    className="btn-secondary mobile-full-btn"
                    style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
                    onClick={closeMobile}
                  >
                    Log In
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}

      {showScrollProgress && <ScrollProgress />}
    </>
  );
}
