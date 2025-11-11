import multer from "multer";
import path from "path";

// Upload folder ensure
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");  // uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

export default upload;
