import express from "express";
import trailService from "../services/trailService.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const trails = trailService.getAllTrails();
    res.json(trails);
  } catch (error) {
    res.status(500).json({ error: "Failed to load trails" });
  }
});

router.get("/:id", (req, res) => {
  try {
    const trail = trailService.getTrailById(req.params.id);
    if (trail) {
      res.json(trail);
    } else {
      res.status(404).json({ error: "Trail not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to load trail" });
  }
});

router.post("/filter", (req, res) => {
  try {
    const filtered = trailService.filterTrails(req.body);
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: "Failed to filter trails" });
  }
});

router.get("/stats/all", (req, res) => {
  try {
    const stats = trailService.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Failed to get statistics" });
  }
});

router.get("/meta/regions", (req, res) => {
  try {
    const regions = trailService.getRegions();
    res.json(regions);
  } catch (error) {
    res.status(500).json({ error: "Failed to get regions" });
  }
});

// Get difficulties
router.get("/meta/difficulties", (req, res) => {
  try {
    const difficulties = trailService.getDifficulties();
    res.json(difficulties);
  } catch (error) {
    res.status(500).json({ error: "Failed to get difficulties" });
  }
});

export default router;
