const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route (optional but useful)
app.get("/", (req, res) => {
  res.send("TruthLens Backend Running 🚀");
});

// Import media routes
const mediaRoutes = require("./routes/mediaRoutes");
app.use("/api/media", mediaRoutes);

// Start server
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});