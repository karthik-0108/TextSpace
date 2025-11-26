import { useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [form, setForm] = useState({ emailOrUsername: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", form);

      // IMPORTANT FIX ✔
      login(res.data.user, res.data.token);

      navigate("/feed");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-layout">
      <div className="card auth-card">
        <h2 style={{ marginBottom: 8 }}>Welcome back</h2>
        <p className="feed-card__meta" style={{ marginBottom: 20 }}>
          Sign in to continue sharing on TextSpace.
        </p>

        {error && (
          <div
            style={{
              background: "rgba(248,113,113,0.15)",
              borderRadius: "12px",
              padding: "12px 16px",
              color: "#b91c1c",
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Email or Username"
            name="emailOrUsername"
            value={form.emailOrUsername}
            onChange={handleChange}
          />
          <input
            placeholder="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />

          <button className="btn btn-primary" type="submit">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
