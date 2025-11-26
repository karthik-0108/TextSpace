const User = require("../models/User");
const Post = require("../models/Post");

// GET LOGGED-IN USER
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password")
    .populate("followers", "username")
    .populate("following", "username");

  res.json(user);
};

// GET USER BY ID
exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("followers", "username")
    .populate("following", "username");

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json(user);
};

// FOLLOW USER
exports.followUser = async (req, res) => {
  const myId = req.user._id;
  const targetId = req.params.id;

  if (myId.toString() === targetId) {
    return res.status(400).json({ message: "You cannot follow yourself." });
  }

  await User.findByIdAndUpdate(myId, {
    $addToSet: { following: targetId },
  });

  await User.findByIdAndUpdate(targetId, {
    $addToSet: { followers: myId },
  });

  res.json({ message: "Followed successfully" });
};

// UNFOLLOW USER
exports.unfollowUser = async (req, res) => {
  const myId = req.user._id;
  const targetId = req.params.id;

  await User.findByIdAndUpdate(myId, {
    $pull: { following: targetId },
  });

  await User.findByIdAndUpdate(targetId, {
    $pull: { followers: myId },
  });

  res.json({ message: "Unfollowed successfully" });
};

// SUGGESTED USERS
exports.getSuggestedUsers = async (req, res) => {
  const currentUser = req.user._id;

  const users = await User.find({ _id: { $ne: currentUser } })
    .select("_id username bio followers")
    .limit(10);

  res.json(users);
};

// ALL USERS
exports.getAllUsers = async (req, res) => {
  const users = await User.find({}).select("-password");
  res.json(users);
};

// USER POSTS
exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.id })
      .populate("user", "username")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch user posts" });
  }
};
