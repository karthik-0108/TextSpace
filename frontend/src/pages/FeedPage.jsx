import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { socket } from "../socket";

export default function FeedPage() {
  const { user } = useAuth();

  const [composerText, setComposerText] = useState("");
  const [posts, setPosts] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFeed = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setFeedLoading(true);
      setError("");

      const res = await api.get("/posts/feed");
      setPosts(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load feed");
    } finally {
      setFeedLoading(false);
    }
  }, []);

  const fetchSuggested = useCallback(async () => {
    try {
      setSuggestionsLoading(true);
      const res = await api.get("/users");
      setSuggested(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  const upsertPost = useCallback((incoming) => {
    if (!incoming?._id) return;
    setPosts((prev) => {
      const exists = prev.some((p) => p._id === incoming._id);
      return exists
        ? prev.map((p) => (p._id === incoming._id ? incoming : p))
        : [incoming, ...prev];
    });
  }, []);

  useEffect(() => {
    fetchFeed(true);
    fetchSuggested();
    const interval = setInterval(fetchFeed, 10000);
    return () => clearInterval(interval);
  }, [fetchFeed, fetchSuggested]);

  useEffect(() => {
    const handleNewPost = (post) => upsertPost(post);
    socket.on("post:new", handleNewPost);
    return () => socket.off("post:new", handleNewPost);
  }, [upsertPost]);

  const createPost = async (e) => {
    e.preventDefault();
    if (!composerText.trim()) return;

    try {
      const res = await api.post("/posts", { text: composerText.trim() });
      upsertPost(res.data);
      setComposerText("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create post");
    }
  };

  const toggleLike = async (postId) => {
    const post = posts.find((p) => p._id === postId);
    if (!post) return;

    const isLiked = post.likes.includes(user._id);

    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? {
              ...p,
              likes: isLiked
                ? p.likes.filter((id) => id !== user._id)
                : [...p.likes, user._id],
            }
          : p
      )
    );

    try {
      await api.post(`/posts/${postId}/${isLiked ? "unlike" : "like"}`);
    } catch {
      fetchFeed();
    }
  };

  const followUser = async (id) => {
    try {
      await api.post(`/users/${id}/follow`);
      setSuggested((prev) => prev.filter((s) => s._id !== id));
      fetchFeed();
    } catch (err) {
      console.error("Follow failed:", err);
    }
  };

  const orderedPosts = useMemo(
    () => [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [posts]
  );

  const filteredSuggestions = useMemo(
    () => suggested.filter((p) => p._id !== user?._id),
    [suggested, user?._id]
  );

  return (
    <div className="page">
      <div className="page-heading">
        <div className="page-heading__title">Community Feed</div>
        <div className="page-heading__pill">
          {feedLoading ? "Syncing..." : `${orderedPosts.length} posts`}
        </div>
      </div>

      {error && (
        <div className="card" style={{ borderLeft: "4px solid #f87171" }}>
          <strong>Heads up:</strong> {error}
        </div>
      )}

      <div className="feed-grid">
        <section>
          <div className="card composer">
            <form onSubmit={createPost}>
              <textarea
                placeholder="Share what's happening..."
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
              />

              <div className="composer-actions">
                <span className="status-chip">
                  {composerText.length > 0
                    ? `${composerText.length} characters`
                    : "Ready to post"}
                </span>

                <button className="btn btn-primary" type="submit">
                  Publish
                </button>
              </div>
            </form>
          </div>

          {feedLoading && orderedPosts.length === 0 ? (
            <div className="card empty-state">Loading your feed…</div>
          ) : orderedPosts.length === 0 ? (
            <div className="card empty-state">
              No conversations yet. Start the first post!
            </div>
          ) : (
            orderedPosts.map((post) => (
              <article key={post._id} className="feed-card">
                <div className="feed-card__header">
                  <div className="avatar">
                    {post.user.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <strong>{post.user.username}</strong>
                    <div className="feed-card__meta">
                      {new Date(post.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <p>{post.text}</p>

                <div className="feed-card__actions">
                  <button
                    className="btn btn-ghost"
                    onClick={() => toggleLike(post._id)}
                  >
                    {post.likes.includes(user._id) ? "♥" : "♡"}{" "}
                    {post.likes.length}
                  </button>
                </div>
              </article>
            ))
          )}
        </section>

        <aside>
          <div className="card">
            <div className="page-heading__title" style={{ fontSize: "1.2rem" }}>
              Suggested creators
            </div>

            <p className="feed-card__meta" style={{ marginBottom: 14 }}>
              Discover people sharing similar stories.
            </p>

            {suggestionsLoading && (
              <div className="empty-state">Fetching people…</div>
            )}

            {!suggestionsLoading && filteredSuggestions.length === 0 && (
              <div className="empty-state">You're connected with everyone!</div>
            )}

            {filteredSuggestions.map((person) => (
              <div key={person._id} className="suggestion-card">
                <strong>{person.username}</strong>
                <p className="feed-card__meta">
                  {person.bio || "No bio yet"}
                </p>

                <button
                  className="btn btn-secondary"
                  onClick={() => followUser(person._id)}
                >
                  Follow
                </button>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
