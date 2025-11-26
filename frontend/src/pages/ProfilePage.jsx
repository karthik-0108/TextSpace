import { useEffect, useState } from "react";
import api from "../api";

export default function ProfilePage() {
  const [me, setMe] = useState(null);
  const [posts, setPosts] = useState([]);
  const [community, setCommunity] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingCommunity, setLoadingCommunity] = useState(true);

  const fetchMe = async () => {
    try {
      setLoadingProfile(true);
      const res = await api.get("/users/me");

      setMe(res.data);

      const postsRes = await api.get(`/posts/user/${res.data._id}`);
      setPosts(postsRes.data);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchCommunity = async () => {
    try {
      setLoadingCommunity(true);
      const res = await api.get("/users/all");
      setCommunity(res.data);
    } finally {
      setLoadingCommunity(false);
    }
  };

  useEffect(() => {
    fetchMe();
    fetchCommunity();
  }, []);

  if (loadingProfile) {
    return <div className="card empty-state">Loading your profile…</div>;
  }

  if (!me) {
    return (
      <div className="card empty-state">
        We couldn’t load your profile. Please try again.
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card">
        <div className="profile-header">
          <div className="avatar avatar-large">
            {me.username?.slice(0, 2).toUpperCase()}
          </div>

          <div>
            <h2 style={{ margin: 0 }}>{me.username}</h2>

            <div className="profile-meta">
              <span>{me.email}</span>
              <span>
                Joined{" "}
                {me.createdAt
                  ? new Date(me.createdAt).toLocaleDateString()
                  : "—"}
              </span>
            </div>

            <p style={{ marginTop: 10 }}>{me.bio || "No bio yet."}</p>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <div className="feed-card__meta">Followers</div>
            <div className="stat-card__value">
              {me.followers?.length || 0}
            </div>
          </div>

          <div className="stat-card">
            <div className="feed-card__meta">Following</div>
            <div className="stat-card__value">
              {me.following?.length || 0}
            </div>
          </div>

          <div className="stat-card">
            <div className="feed-card__meta">Posts</div>
            <div className="stat-card__value">{posts.length}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>
          Everyone on TextSpace
        </h3>

        {loadingCommunity ? (
          <div className="empty-state">Loading community…</div>
        ) : (
          <div className="profile-network">
            {community.map((person) => (
              <div
                key={person._id}
                className={`profile-circle ${
                  person._id === me._id ? "profile-circle--me" : ""
                }`}
              >
                <div className="avatar avatar-tiny">
                  {person.username.slice(0, 2).toUpperCase()}
                </div>
                <span>
                  {person.username}
                  {person._id === me._id ? " (You)" : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>My posts</h3>
        {posts.length === 0 ? (
          <div className="empty-state">No posts yet.</div>
        ) : (
          posts.map((post) => (
            <article key={post._id} className="feed-card">
              <p>{post.text}</p>
              <div className="feed-card__meta">
                {new Date(post.createdAt).toLocaleString()}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
