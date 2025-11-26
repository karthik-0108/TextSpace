const express = require("express");
const requireAuth = require("../middleware/authMiddleware");

const {
  getMe,
  getUserById,
  followUser,
  unfollowUser,
  getSuggestedUsers,
  getAllUsers,
  getUserPosts,
} = require("../controllers/userController");

const router = express.Router();

// Get logged-in user
router.get("/me", requireAuth, getMe);

// Get all users (admin or general list)
router.get("/all", requireAuth, getAllUsers);

// Suggested creators
router.get("/", requireAuth, getSuggestedUsers);

// Follow / Unfollow
router.post("/:id/follow", requireAuth, followUser);
router.post("/:id/unfollow", requireAuth, unfollowUser);

// Get posts of a specific user
router.get("/:id/posts", requireAuth, getUserPosts);

// Get a specific user profile
router.get("/:id", requireAuth, getUserById);

module.exports = router;
