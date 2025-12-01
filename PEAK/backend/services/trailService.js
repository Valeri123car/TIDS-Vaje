import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TrailService {
  constructor() {
    this.trailsPath = path.join(__dirname, "./trails.json");
    this.trails = [];
    this.loadTrails();
  }

  async loadTrails() {
    try {
      const data = await fs.readFile(this.trailsPath, "utf-8");
      this.trails = JSON.parse(data);
      console.log(`Loaded ${this.trails.length} trails`);
    } catch (error) {
      console.error("Error loading trails:", error);
      this.trails = [];
    }
  }

  getAllTrails() {
    return this.trails;
  }

  getTrailById(id) {
    return this.trails.find((trail) => trail.id === parseInt(id));
  }

  filterTrails(filters) {
    let filtered = [...this.trails];

    if (filters.difficulty) {
      filtered = filtered.filter((trail) =>
        trail.Zahtevnost?.toLowerCase().includes(
          filters.difficulty.toLowerCase()
        )
      );
    }

    if (filters.region) {
      filtered = filtered.filter((trail) =>
        trail.Teritorij?.toLowerCase().includes(filters.region.toLowerCase())
      );
    }

    if (filters.maxDistance) {
      filtered = filtered.filter((trail) => {
        const distance = parseFloat(
          trail.Razdalja?.replace(",", ".").replace(" km", "")
        );
        return !isNaN(distance) && distance <= parseFloat(filters.maxDistance);
      });
    }

    if (filters.maxAscent) {
      filtered = filtered.filter((trail) => {
        const ascent = parseInt(trail.Vzpon?.replace(" m", ""));
        return !isNaN(ascent) && ascent <= parseInt(filters.maxAscent);
      });
    }

    return filtered;
  }

  getStats() {
    const distances = this.trails
      .map((t) => parseFloat(t.Razdalja?.replace(",", ".").replace(" km", "")))
      .filter((d) => !isNaN(d));

    const ascents = this.trails
      .map((t) => parseInt(t.Vzpon?.replace(" m", "")))
      .filter((a) => !isNaN(a));

    const durations = this.trails
      .map((t) => {
        const match = t["Čas hoje"]?.match(/(\d+)\s*h\s*(\d+)?\s*min/);
        if (!match) return null;
        const hours = parseInt(match[1]);
        const mins = parseInt(match[2] || 0);
        return hours * 60 + mins;
      })
      .filter((d) => d !== null);

    return {
      total: this.trails.length,
      avgDistance: distances.length
        ? (distances.reduce((a, b) => a + b, 0) / distances.length).toFixed(2)
        : 0,
      avgAscent: ascents.length
        ? Math.round(ascents.reduce((a, b) => a + b, 0) / ascents.length)
        : 0,
      avgDuration: durations.length
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0,
      maxDistance: distances.length ? Math.max(...distances).toFixed(2) : 0,
      maxAscent: ascents.length ? Math.max(...ascents) : 0,
    };
  }

  getRegions() {
    const regions = [
      ...new Set(this.trails.map((t) => t.Teritorij).filter(Boolean)),
    ];
    return regions.sort();
  }

  getDifficulties() {
    const difficulties = [
      ...new Set(this.trails.map((t) => t.Zahtevnost).filter(Boolean)),
    ];
    return difficulties.sort();
  }
}

export default new TrailService();
