// frontend/src/utils/helpers.js

// Format date to "2 hours ago", "Yesterday"
export const timeAgo = (date) => {
  const now = new Date();
  const diff = (now - new Date(date)) / 1000; // seconds

  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + " min ago";
  if (diff < 86400) return Math.floor(diff / 3600) + " hrs ago";
  if (diff < 172800) return "yesterday";

  return new Date(date).toLocaleDateString();
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Check if a post is liked by current user
export const isLiked = (post, userId) => {
  return post.likes.some((id) => id === userId);
};

// Safely parse JSON from localStorage
export const safeParseJSON = (value, fallback = null) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

// Save JSON to localStorage safely
export const safeSetJSON = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Trim text and prevent empty posts/messages
export const cleanText = (text) => {
  return text?.trim();
};

// Truncate text for previews
export const truncate = (text, limit = 100) => {
  if (!text) return "";
  if (text.length <= limit) return text;
  return text.substring(0, limit) + "...";
};

// Scroll chat to bottom smoothly
export const scrollToBottom = (ref) => {
  if (ref?.current) {
    ref.current.scrollTop = ref.current.scrollHeight;
  }
};

// Sort chat messages by time
export const sortMessages = (messages) => {
  return messages.sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );
};

// Generate initials from username
export const getInitials = (name = "") => {
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
};

// Check if two IDs match
export const isSameUser = (id1, id2) => id1 === id2;

// Convert timestamp for chat UI
export const formatChatTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};
