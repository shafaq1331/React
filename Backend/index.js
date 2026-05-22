// index.js
require("dotenv").config(); // Load environment variables

const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");

const app = express();
app.use(cors({
  origin: "https://your-frontend.vercel.app", // replace with your actual Vercel frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// ===== MongoDB Connection =====
const MONGODB_URI = process.env.MONGODB_URI;

async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("MongoDB connected!");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1); // Exit if DB connection fails
    }
}

// ===== Mongoose User Model =====
const User = mongoose.model(
    "User",
    new mongoose.Schema({ image: String }, { strict: false })
);

// ===== Cloudinary Configuration =====
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ===== Multer Setup =====
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ===== Upload Endpoint =====
app.post("/api/upload", upload.single("image"), async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ error: "Image is required" });

        const b64 = Buffer.from(file.buffer).toString("base64");
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        const result = await cloudinary.uploader.upload(dataURI);

        const userData = { ...req.body, image: result.secure_url };
        const user = await User.create(userData);

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== Get Users Endpoint =====
app.get("/api/users", async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== Start Server =====
const PORT = process.env.PORT || 5002;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
