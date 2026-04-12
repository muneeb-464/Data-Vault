import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Menu, X, LogOut, User, Sun, Moon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Pricing", path: "/pricing" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  // Default to dark
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  // Apply theme on mount + change
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const isDark = theme === "dark";

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 nav-glass"
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">

        {/* Logo */}
        <Link to="/" className="font-heading text-xl font-bold text-primary">
          DataVault
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium uppercase tracking-wider transition-colors hover:text-primary ${
                location.pathname === link.path
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="hidden md:flex items-center gap-3">

          {/* ── Enhanced Sky Toggle ── */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="relative w-16 h-8 rounded-full border-none outline-none cursor-pointer
              overflow-hidden transition-all duration-400 active:scale-95
              focus-visible:ring-2 focus-visible:ring-primary/50"
            style={{ background: isDark ? "#2E3255" : "#E8D96B" }}
          >
            {/* Stars — visible in dark */}
            {[
              { w: 3,   h: 3,   top: 7,  left: 14 },
              { w: 2,   h: 2,   top: 13, left: 22 },
              { w: 2.5, h: 2.5, top: 18, left: 10 },
              { w: 2,   h: 2,   top: 9,  left: 30 },
            ].map((s, i) => (
              <span
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: s.w,
                  height: s.h,
                  top: s.top,
                  left: s.left,
                  transition: "opacity 0.35s ease, transform 0.35s ease",
                  opacity: isDark ? 1 : 0,
                  transform: isDark ? "scale(1)" : "scale(0)",
                }}
              />
            ))}

            {/* Clouds — visible in light */}
            {[
              { w: 16, h: 6,  top: 9,  left: 11, op: 0.7 },
              { w: 10, h: 5,  top: 18, left: 16, op: 0.4 },
            ].map((c, i) => (
              <span
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: c.w,
                  height: c.h,
                  top: c.top,
                  left: c.left,
                  transition: "opacity 0.3s ease, transform 0.3s ease",
                  opacity: isDark ? 0 : c.op,
                  transform: isDark ? "translateX(-4px)" : "translateX(0)",
                }}
              />
            ))}

            {/* Knob with spring overshoot */}
            <span
              className="absolute top-[3px] flex items-center justify-center
                w-[26px] h-[26px] rounded-full z-10"
              style={{
                left: isDark ? 35 : 3,
                background: isDark ? "#D0D8F8" : "#fff",
                boxShadow: isDark
                  ? "0 1px 6px rgba(0,0,0,0.35)"
                  : "0 1px 4px rgba(0,0,0,0.18)",
                transition:
                  "left 0.38s cubic-bezier(.34,1.56,.64,1), background 0.4s ease, box-shadow 0.3s ease",
              }}
            >
              {/* Sun icon */}
              <svg
                style={{
                  position: "absolute",
                  transition: "opacity 0.25s ease, transform 0.3s ease",
                  opacity: isDark ? 0 : 1,
                  transform: isDark ? "scale(0.6) rotate(30deg)" : "scale(1) rotate(0deg)",
                }}
                width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="4"/>
                <line x1="12" y1="2"  x2="12" y2="5"/>
                <line x1="12" y1="19" x2="12" y2="22"/>
                <line x1="4.22" y1="4.22"   x2="6.34"  y2="6.34"/>
                <line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
                <line x1="2"  y1="12" x2="5"  y2="12"/>
                <line x1="19" y1="12" x2="22" y2="12"/>
                <line x1="4.22"  y1="19.78" x2="6.34"  y2="17.66"/>
                <line x1="17.66" y1="6.34"  x2="19.78" y2="4.22"/>
              </svg>

              {/* Moon icon */}
              <svg
                style={{
                  position: "absolute",
                  transition: "opacity 0.25s ease, transform 0.3s ease",
                  opacity: isDark ? 1 : 0,
                  transform: isDark ? "scale(1) rotate(0deg)" : "scale(0.6) rotate(-30deg)",
                }}
                width="13" height="13" viewBox="0 0 24 24" fill="#4C5FA0"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>
              </svg>
            </span>
          </button>

          {/* Auth */}
          {user ? (
            <>
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <User size={14} />
                {profile?.full_name || user.email?.split("@")[0]}
              </span>
              <button
                onClick={handleSignOut}
                className="text-sm font-medium text-foreground hover:text-destructive transition-colors flex items-center gap-1"
              >
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/account"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Login
              </Link>
              <Link
                to="/account"
                className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl"
        >
          <div className="flex flex-col p-4 gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`text-sm font-medium py-2 ${
                  location.pathname === link.path
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile toggle — compact row version */}
            <div className="flex items-center gap-3 py-2">
              <span className="text-sm text-muted-foreground">
                {isDark ? "Dark mode" : "Light mode"}
              </span>
              <button
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                className="relative w-16 h-8 rounded-full border-none outline-none cursor-pointer overflow-hidden active:scale-95"
                style={{ background: isDark ? "#2E3255" : "#E8D96B" }}
              >
                {[
                  { w: 3, h: 3, top: 7, left: 14 },
                  { w: 2, h: 2, top: 13, left: 22 },
                  { w: 2.5, h: 2.5, top: 18, left: 10 },
                  { w: 2, h: 2, top: 9, left: 30 },
                ].map((s, i) => (
                  <span key={i} className="absolute rounded-full bg-white"
                    style={{
                      width: s.w, height: s.h, top: s.top, left: s.left,
                      transition: "opacity 0.35s ease, transform 0.35s ease",
                      opacity: isDark ? 1 : 0,
                      transform: isDark ? "scale(1)" : "scale(0)",
                    }}
                  />
                ))}
                {[
                  { w: 16, h: 6, top: 9, left: 11, op: 0.7 },
                  { w: 10, h: 5, top: 18, left: 16, op: 0.4 },
                ].map((c, i) => (
                  <span key={i} className="absolute rounded-full bg-white"
                    style={{
                      width: c.w, height: c.h, top: c.top, left: c.left,
                      transition: "opacity 0.3s ease, transform 0.3s ease",
                      opacity: isDark ? 0 : c.op,
                      transform: isDark ? "translateX(-4px)" : "translateX(0)",
                    }}
                  />
                ))}
                <span
                  className="absolute top-[3px] flex items-center justify-center w-[26px] h-[26px] rounded-full z-10"
                  style={{
                    left: isDark ? 35 : 3,
                    background: isDark ? "#D0D8F8" : "#fff",
                    boxShadow: isDark ? "0 1px 6px rgba(0,0,0,0.35)" : "0 1px 4px rgba(0,0,0,0.18)",
                    transition: "left 0.38s cubic-bezier(.34,1.56,.64,1), background 0.4s ease",
                  }}
                >
                  <svg style={{ position: "absolute", transition: "opacity 0.25s ease", opacity: isDark ? 0 : 1 }}
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="4"/>
                    <line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>
                    <line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
                    <line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>
                  </svg>
                  <svg style={{ position: "absolute", transition: "opacity 0.25s ease", opacity: isDark ? 1 : 0 }}
                    width="13" height="13" viewBox="0 0 24 24" fill="#4C5FA0">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>
                  </svg>
                </span>
              </button>
            </div>

            {user ? (
              <button
                onClick={() => { handleSignOut(); setMobileOpen(false); }}
                className="text-sm font-medium text-destructive py-2 text-left"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/account"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg text-center mt-2"
              >
                Sign Up
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Navbar;