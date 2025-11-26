const express = require("express");
const auth = require("../middleware/authMiddleware");
const {
  createPost,
  getFeed,
  getUserPosts,
  likePost,
  unlikePost,
} = require("../controllers/postController");
const router = express.Router();
router.post("/", auth, createPost);
router.get("/feed", auth, getFeed);
router.get("/user/:userId", auth, getUserPosts);
router.post("/:id/like", auth, likePost);
router.post("/:id/unlike", auth, unlikePost);

module.exports = router;
