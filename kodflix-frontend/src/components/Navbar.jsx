import { useAuth } from "../context/AuthContext";

export default function Navbar({ onSearchChange }) {
  const { user, logout } = useAuth();

  const initials =
    user?.username?.slice(0, 2).toUpperCase() ||
    user?.full_name?.slice(0, 2).toUpperCase() ||
    "KF";

  return (
    <nav className="navbar">
      <div className="nav-logo">KodFlix</div>
      <div className="nav-right">
        <div className="nav-search">
          <input
            type="text"
            placeholder="Search"
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
        <div className="nav-avatar">{initials}</div>
        <button className="nav-logout" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

