import express from "express";
import authService from "../services/authService.js";

const router = express.Router();

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const user = await authService.login(email, password);
    res.json({
      success: true,
      user,
      message: "Login successful",
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message,
    });
  }
});

// Register
router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: "All fields required" });
  }

  try {
    const user = await authService.register(email, password, name);
    res.status(201).json({
      success: true,
      user,
      message: "Registration successful",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Get current user
router.get("/me/:userId", (req, res) => {
  try {
    const user = authService.getUserById(req.params.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put("/profile/:userId", async (req, res) => {
  try {
    const user = await authService.updateUser(req.params.userId, req.body);
    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get completed hikes
router.get("/hikes/:userId", (req, res) => {
  try {
    const hikes = authService.getCompletedHikes(req.params.userId);
    res.json(hikes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add completed hike - 👇 POSODOBLJENA FUNKCIJA
router.post("/hikes", async (req, res) => {
  const { userId, trailId, ...hikeData } = req.body;

  if (!userId || !trailId) {
    return res.status(400).json({ error: "UserId and trailId required" });
  }

  try {
    const hike = await authService.addCompletedHike(userId, trailId, hikeData);

    // 👇 AVTOMATSKO DODAJ V PRILJUBLJENE
    const isFav = authService.isFavorite(userId, trailId);
    if (!isFav) {
      await authService.addFavoriteTrail(userId, trailId);
    }

    res.status(201).json({
      success: true,
      hike,
      message: "Pohod dodan in označen kot priljubljen!",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete completed hike - 👇 POSODOBLJENA FUNKCIJA
router.delete("/hikes/:hikeId", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "UserId required" });
  }

  try {
    // 👇 PREVERI ČE JE BIL TO EDINI POHOD TE POTI
    const hike = authService
      .getCompletedHikes(userId)
      .find((h) => h.id === req.params.hikeId);

    if (!hike) {
      return res.status(404).json({ error: "Hike not found" });
    }

    await authService.deleteCompletedHike(req.params.hikeId, userId);

    // 👇 ČE NI VEČ NOBENEGA POHODA TE POTI, ODSTRANI IZ PRILJUBLJENIH
    const otherHikesOnSameTrail = authService
      .getCompletedHikes(userId)
      .filter((h) => h.trailId === hike.trailId);

    if (otherHikesOnSameTrail.length === 0) {
      try {
        await authService.removeFavoriteTrail(userId, hike.trailId);
      } catch (err) {
        // Če ni v priljubljenih, ni problema
      }
    }

    res.json({ success: true, message: "Hike deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get hike statistics
router.get("/stats/:userId", (req, res) => {
  try {
    const stats = authService.getHikeStats(req.params.userId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get favorite trails
router.get("/favorites/:userId", (req, res) => {
  try {
    const favorites = authService.getFavoriteTrails(req.params.userId);
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add favorite trail - 👇 KEEP THIS FOR MANUAL ADDING (optional)
router.post("/favorites", async (req, res) => {
  const { userId, trailId } = req.body;

  if (!userId || !trailId) {
    return res.status(400).json({ error: "UserId and trailId required" });
  }

  try {
    await authService.addFavoriteTrail(userId, trailId);
    res.json({ success: true, message: "Added to favorites" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Remove favorite trail - 👇 KEEP THIS FOR MANUAL REMOVING (optional)
router.delete("/favorites", async (req, res) => {
  const { userId, trailId } = req.body;

  if (!userId || !trailId) {
    return res.status(400).json({ error: "UserId and trailId required" });
  }

  try {
    await authService.removeFavoriteTrail(userId, trailId);
    res.json({ success: true, message: "Removed from favorites" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Check if trail is favorite
router.get("/favorites/:userId/:trailId", (req, res) => {
  try {
    const isFavorite = authService.isFavorite(
      req.params.userId,
      req.params.trailId
    );
    res.json({ isFavorite });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
