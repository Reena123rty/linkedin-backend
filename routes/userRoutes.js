import express from "express";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import upload from "../config/multer.js";

const router = express.Router();

// ✅ Upload profile picture
router.post("/upload-profile", auth, upload.single("profile"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.profileImage = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      profileImage: user.profileImage,
      message: "Profile updated successfully ✅"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get logged in user
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

export default router;
