import express from "express";

const router = express.Router();

let users = [];
let userHikes = [];

router.get("/profile/:userId", (req, res) => {
  const user = users.find((u) => u.id === req.params.userId);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

router.post("/profile", (req, res) => {
  const { id, name, email } = req.body;

  const existingUserIndex = users.findIndex((u) => u.id === id);

  if (existingUserIndex >= 0) {
    users[existingUserIndex] = { ...users[existingUserIndex], name, email };
    res.json(users[existingUserIndex]);
  } else {
    const newUser = { id, name, email, createdAt: new Date().toISOString() };
    users.push(newUser);
    res.status(201).json(newUser);
  }
});

router.get("/hikes/:userId", (req, res) => {
  const hikes = userHikes.filter((h) => h.userId === req.params.userId);
  res.json(hikes);
});

router.post("/hikes", (req, res) => {
  const { userId, trailId, date, duration, notes } = req.body;

  const newHike = {
    id: Date.now().toString(),
    userId,
    trailId: parseInt(trailId),
    date: date || new Date().toISOString(),
    duration,
    notes,
    createdAt: new Date().toISOString(),
  };

  userHikes.push(newHike);
  res.status(201).json(newHike);
});

router.delete("/hikes/:hikeId", (req, res) => {
  const index = userHikes.findIndex((h) => h.id === req.params.hikeId);

  if (index >= 0) {
    userHikes.splice(index, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Hike not found" });
  }
});

router.get("/stats/:userId", (req, res) => {
  const hikes = userHikes.filter((h) => h.userId === req.params.userId);

  const totalHikes = hikes.length;
  const totalDuration = hikes.reduce((sum, h) => sum + (h.duration || 0), 0);

  res.json({
    totalHikes,
    totalDuration,
    avgDuration: totalHikes > 0 ? Math.round(totalDuration / totalHikes) : 0,
  });
});

export default router;
