const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/test").then(()=>{
  console.log("MongoDb Connected")
});

const User = mongoose.model(
  "User",
  new mongoose.Schema(
    { image: String },
    { strict: false }
  )
);

cloudinary.config({
  cloud_name: "di7yfp5ta",
  api_key: "829571181959791",
  api_secret: "7ga4FT56xIp2h5bru0aWSYF538g"
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Image is required" });
    }

    const b64 = Buffer.from(file.buffer).toString("base64");
    const dataURI = `data:${file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataURI);

    const userData = {
      ...req.body,
      image: result.secure_url,
    };

    const user = await User.create(userData);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Get Users =====
app.get("/api/users", async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// ===== Server =====
app.listen(5002, () => {
  console.log("Server running on http://localhost:5000");
});