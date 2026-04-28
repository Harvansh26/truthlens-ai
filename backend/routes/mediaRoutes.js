const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) cb(null, "uploads/images");
    else if (file.mimetype.startsWith("video/")) cb(null, "uploads/videos");
    else if (file.mimetype.startsWith("audio/")) cb(null, "uploads/audios");
    else cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/analyze-media", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const mediaType = req.body.mediaType;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const formData = new FormData();
    formData.append("file", fs.createReadStream(file.path));
    formData.append("mediaType", mediaType);

    const aiResponse = await axios.post(
      "http://localhost:8000/analyze-media",
      formData,
      { headers: formData.getHeaders() }
    );

    res.json({
      message: "Media analyzed successfully",
      fileName: file.originalname,
      mediaType,
      result: aiResponse.data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Media analysis failed" });
  }
});

module.exports = router;