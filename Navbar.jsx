import { useState } from "react";
import { Leaf, Menu, Search, X } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const runSearch = (event) => {
    event.preventDefault();
    navigate(
      /crop|soil|recommend/i.test(query)
        ? "/features/crop-recommendation"
        : "/features",
    );
    setSearchOpen(false);
    setMenuOpen(false);
    setQuery("");
  };
  const links = [
    { label: "Home", to: "/" },
    { label: "Features", to: "/features" },
    { label: "How It Works", to: "/#how-it-works" },
    { label: "About", to: "/#about" },
    { label: "Contact", to: "/#contact" },
  ];
  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link className="brand" to="/" aria-label="Smart Farm AI home">
          <span className="brand-mark">
            <Leaf size={21} strokeWidth={2.2} />
          </span>
          <span className="brand-copy">
            <strong>SMART FARM AI</strong>
            <small>
              DATA TODAY <i /> BETTER TOMORROW
            </small>
          </span>
        </Link>
        <nav
          className={`main-nav ${menuOpen ? "is-open" : ""}`}
          aria-label="Main navigation"
        >
          {links.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="nav-actions">
          <button
            className="icon-button search-toggle"
            aria-label="Search"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            {searchOpen ? <X size={19} /> : <Search size={19} />}
          </button>
          <Link className="login-link" to="/login">
            Log in
          </Link>
          <Link className="button button-small" to="/signup">
            Sign Up <span>↗</span>
          </Link>
          <button
            className="icon-button menu-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
      {searchOpen && (
        <form className="search-panel" onSubmit={runSearch}>
          <Search size={18} />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search farm tools..."
            aria-label="Search farm tools"
          />
          <button type="submit">Search</button>
        </form>
      )}
    </header>
  );
}
