import { Link, NavLink } from "react-router-dom";
import { Search } from "lucide-react";
import Brand from "./Brand.jsx";

export default function PublicNav() {
  return (
    <header className="kyurNav">
      <Link to="/" className="brandLink">
        <Brand />
      </Link>

      <nav className="navLinks">
        <NavLink to="/" end>
          Home
        </NavLink>

        <a href="/#how-it-works">Hall of Lost and Found</a>

        <a href="/#management">Management</a>

        <NavLink to="/about">About</NavLink>
      </nav>

      <div className="navSearch">
        <Search size={34} />
        <input type="search" placeholder="Search for an item" />
      </div>

      <Link to="/login" className="reportBtn">
        Report Lost Item
      </Link>
    </header>
  );
}