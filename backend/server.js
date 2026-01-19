import express from "express";
import cors from "cors";
import { videos } from "./data/videos.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/videos", (req, res) => {
  res.json({ videos });
});

app.post("/api/videos/selection", (req, res) => {
  const { videoIds = [], platforms = [] } = req.body || {};
  console.log("Selection received:", { videoIds, platforms });
  res.json({
    ok: true,
    selectedCount: videoIds.length,
    platforms
  });
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
