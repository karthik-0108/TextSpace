import { Routes, Route, Navigate, NavLink } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import FeedPage from "./pages/FeedPage";
import ProfilePage from "./pages/ProfilePage";
import ChatPage from "./pages/ChatPage";
import { useMemo } from "react";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

export default function App() {
  const { user, logout } = useAuth();
  const navLinks = useMemo(
    () =>
      user
        ? [
            { to: "/", label: "Feed" },
            { to: "/profile", label: "Profile" },
            { to: "/chat", label: "Chat" },
          ]
        : [
            { to: "/login", label: "Login" },
            { to: "/register", label: "Register" },
          ],
    [user]
  );

  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="brand">
          <span className="brand-badge">TS</span>
          <div>
            <div>TextSpace</div>
            <small style={{ color: "var(--text-muted)", fontWeight: 500 }}>
              Say more. Share smarter.
            </small>
          </div>
        </div>
        <div className="nav-links">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `nav-link${isActive ? " active" : ""}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {user && (
            <button className="btn btn-secondary" onClick={logout}>
              Logout
            </button>
          )}
        </div>
      </header>

      <main className="app-content">
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <FeedPage />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
