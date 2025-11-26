// backend/controllers/postController.js
const Post = require("../models/Post");


// @desc Create a text post
exports.createPost = async (req, res) => {
  const { text } = req.body;

  if (!text) return res.status(400).json({ message: "Text is required" });

  const post = await Post.create({ user: req.user._id, text });
  await post.populate("user", "username");

  const io = req.app.get("io");
  if (io) {
    io.emit("post:new", post);
  }

  res.status(201).json(post);
};

// @desc Get global feed (all posts)
exports.getFeed = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Get posts of a user
exports.getUserPosts = async (req, res) => {
  const posts = await Post.find({ user: req.params.userId })
    .populate("user", "username")
    .sort({ createdAt: -1 });

  res.json(posts);
};


// @desc Like post
exports.likePost = async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) return res.status(404).json({ message: "Post not found" });

  const userId = req.user._id.toString();
  const hasLiked = post.likes.map((id) => id.toString()).includes(userId);

  if (!hasLiked) {
    post.likes.push(req.user._id);
    await post.save();
  }

  res.json({ likesCount: post.likes.length });
};


// @desc Unlike post
exports.unlikePost = async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) return res.status(404).json({ message: "Post not found" });

  post.likes = post.likes.filter(
    (id) => id.toString() !== req.user._id.toString()
  );

  await post.save();

  res.json({ likesCount: post.likes.length });
};
