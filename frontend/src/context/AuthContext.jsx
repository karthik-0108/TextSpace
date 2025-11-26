import { createContext, useContext, useEffect, useState } from "react";
import { socket } from "../socket";
import api, { setAuthToken } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("user")) || null
  );
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");

  // ---------- LOGIN ----------
  const login = (userData, authToken) => {
    // Save in localStorage
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));

    // Set in state
    setUser(userData);
    setToken(authToken);

    // Apply token globally for axios
    setAuthToken(authToken);

    // Connect socket for chat
    socket.connect();
    socket.emit("register", userData._id);
  };

  // Load token on refresh
  useEffect(() => {
    if (token) {
      setAuthToken(token);
    }
  }, [token]);

  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    socket.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
