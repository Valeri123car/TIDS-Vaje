import express from "express";
import weatherService from "../services/weatherService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Latitude and longitude required" });
  }

  try {
    const weather = await weatherService.getWeather(lat, lon);
    res.json(weather);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/forecast", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Latitude and longitude required" });
  }

  try {
    const forecast = await weatherService.getForecast(lat, lon);
    res.json(forecast);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
