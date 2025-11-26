import { useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    bio: "",
  });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/register", form);
      login(res.data.user, res.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-layout">
      <div className="card auth-card">
        <h2 style={{ marginBottom: 8 }}>Create your TextSpace</h2>
        <p className="feed-card__meta" style={{ marginBottom: 20 }}>
          Join the community and start following conversations.
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
            placeholder="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
          />
          <input
            placeholder="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
          <input
            placeholder="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />
          <textarea
            placeholder="Bio"
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={3}
          />
          <button className="btn btn-primary" type="submit">
            Create account
          </button>
        </form>
      </div>
    </div>
  );
}
