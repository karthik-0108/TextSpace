import { useEffect, useMemo, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { socket } from "../socket";

export default function ChatPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingThread, setLoadingThread] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      const res = await api.get("/users/all");
      setUsers(res.data);
    };
    loadUsers();
  }, []);

  useEffect(() => {
    if (!activeUser) return;
    const fetchMessages = async () => {
      setLoadingThread(true);
      const res = await api.get(`/messages/${activeUser._id}`);
      setMessages(res.data);
      setLoadingThread(false);
    };
    fetchMessages();
  }, [activeUser]);

  useEffect(() => {
    const handler = (msg) => {
      if (
        msg.sender === activeUser?._id ||
        (msg.receiver === activeUser?._id && msg.sender === user._id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("message", handler);
    return () => {
      socket.off("message", handler);
    };
  }, [activeUser, user._id]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() || !activeUser) return;

    const payload = {
      senderId: user._id,
      receiverId: activeUser._id,
      text: text.trim(),
    };

    socket.emit("sendMessage", payload);

    setMessages((prev) => [
      ...prev,
      {
        _id: `${Date.now()}`,
        sender: user._id,
        receiver: activeUser._id,
        text: payload.text,
        createdAt: new Date().toISOString(),
      },
    ]);
    setText("");
  };

  const everyone = useMemo(() => users, [users]);

  return (
    <div className="page">
      <div className="page-heading">
        <div className="page-heading__title">Direct messages</div>
        <div className="page-heading__pill">
          {everyone.length} registered users
        </div>
      </div>

      <div className="chat-layout">
        <div className="chat-sidebar">
          {everyone.map((person) => {
            const isMe = person._id === user._id;
            const isActive = activeUser?._id === person._id;
            return (
            <div
              key={person._id}
                className={`chat-user${isActive ? " active" : ""}${
                  isMe ? " disabled" : ""
                }`}
                onClick={() => {
                  if (!isMe) setActiveUser(person);
                }}
            >
                <div style={{ fontWeight: 600 }}>
                  {person.username}
                  {isMe ? " (You)" : ""}
                </div>
              <div className="feed-card__meta">
                  {isMe
                    ? "Your space"
                    : person.bio || "Available to chat"}
              </div>
            </div>
            );
          })}
          {everyone.length === 0 && (
            <div className="empty-state" style={{ padding: "20px 0" }}>
              Invite someone to start chatting.
            </div>
          )}
        </div>

        <div className="chat-thread">
          {activeUser ? (
            <>
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid rgba(226,232,240,0.8)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div className="avatar">
                  {activeUser.username.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <strong>{activeUser.username}</strong>
                  <div className="feed-card__meta">Live conversation</div>
                </div>
              </div>
              <div className="chat-thread__body">
                {loadingThread ? (
                  <div className="empty-state">Loading messages…</div>
                ) : messages.length === 0 ? (
                  <div className="empty-state">
                    Break the ice with a friendly hello.
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      style={{
                        display: "flex",
                        justifyContent:
                          msg.sender === user._id ? "flex-end" : "flex-start",
                      }}
                    >
                      <div
                        className={`bubble ${
                          msg.sender === user._id ? "me" : "them"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <form className="chat-composer" onSubmit={sendMessage}>
                <input
                  placeholder={`Message ${activeUser.username}…`}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button className="btn btn-primary" type="submit">
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="empty-state" style={{ width: "100%" }}>
              Select a person to start chatting.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
