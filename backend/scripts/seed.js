/**
 * Simple seed script to create demo users and posts.
 * Usage:
 *   MONGO_URI="mongodb://localhost:27017/TextSpace" node scripts/seed.js
 * or ensure .env already defines MONGO_URI.
 */
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const User = require("../models/User");
const Post = require("../models/Post");

const uri =
  process.env.MONGO_URI || "mongodb://localhost:27017/TextSpace";

async function seed() {
  await mongoose.connect(uri);

  console.log("Connected to MongoDB, wiping existing demo data...");
  await User.deleteMany({});
  await Post.deleteMany({});

  const users = await User.create([
    {
      username: "textspace_alex",
      email: "alex@example.com",
      password: "hashed-placeholder",
      bio: "Building better conversations.",
    },
    {
      username: "textspace_ria",
      email: "ria@example.com",
      password: "hashed-placeholder",
      bio: "Designing the next story.",
    },
    {
      username: "textspace_sam",
      email: "sam@example.com",
      password: "hashed-placeholder",
      bio: "Chatting about tech.",
    },
  ]);

  // simple follow network
  users[0].following = [users[1]._id];
  users[1].followers = [users[0]._id];
  await users[0].save();
  await users[1].save();

  await Post.create([
    { user: users[0]._id, text: "TextSpace is live! 🚀" },
    { user: users[1]._id, text: "Design drop coming soon." },
    { user: users[2]._id, text: "Any favorite chat features?" },
  ]);

  console.log("Seed data inserted.");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

