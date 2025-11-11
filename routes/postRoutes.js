import express from "express";
import Post from "../models/Post.js";
import auth from "../middleware/auth.js";
import upload from "../config/multer.js";

const router = express.Router();

// ✅ Create Post (text + image)
router.post("/create", auth, upload.single("image"), async (req, res) => {
  try {
    const post = new Post({
      content: req.body.text || "",
      image: req.file ? `/uploads/${req.file.filename}` : null,
      user: req.user.id,
    });

    await post.save();
    return res.json({ success: true, post });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Get posts (with comments + user)
router.get("/", auth, async (_req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name profileImage")
      .populate("comments.user", "name profileImage")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Error loading posts" });
  }
});

// ✅ Like/Unlike Post
router.post("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const uid = req.user.id;
    const liked = post.likes.includes(uid);

    if (liked) post.likes = post.likes.filter((id) => id !== uid);
    else post.likes.push(uid);

    await post.save();
    res.json({ likes: post.likes.length });
  } catch (err) {
    res.status(500).json({ error: "Error liking post" });
  }
});

// ✅ Add Comment
router.post("/:id/comment", auth, async (req, res) => {
  try {
    if (!req.body.text) return res.status(400).json({ msg: "Comment required" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const newComment = {
      user: req.user.id,
      text: req.body.text,
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    const updatedPost = await Post.findById(req.params.id)
      .populate("user", "name profileImage")
      .populate("comments.user", "name profileImage");

    res.json({ success: true, post: updatedPost });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE POST ROUTE (⭐ New Added)
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Allow only owner to delete
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
