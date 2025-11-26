// backend/controllers/authController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const genToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });


// @desc Register new user
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password, bio } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const existing = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ username, email, password, bio });

    const token = genToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


// @desc Login user
exports.loginUser = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password)
      return res
        .status(400)
        .json({ message: "Email/Username and password required" });

    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = genToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
