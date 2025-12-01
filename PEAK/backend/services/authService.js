import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AuthService {
  constructor() {
    this.usersPath = path.join(__dirname, "../data/users.json");
    this.data = { users: [], completedHikes: [], favoriteTrails: [] };
    this.loadData();
  }

  async loadData() {
    try {
      const fileData = await fs.readFile(this.usersPath, "utf-8");
      this.data = JSON.parse(fileData);
      console.log(`Loaded ${this.data.users.length} users`);
    } catch (error) {
      console.error("Error loading users:", error);
      await this.saveData();
    }
  }

  async saveData() {
    try {
      await fs.writeFile(
        this.usersPath,
        JSON.stringify(this.data, null, 2),
        "utf-8"
      );
    } catch (error) {
      console.error("Error saving users:", error);
    }
  }

  // Authentication
  async login(email, password) {
    const user = this.data.users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Don't send password back
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async register(email, password, name) {
    // Check if user exists
    const existingUser = this.data.users.find((u) => u.email === email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const newUser = {
      id: `user${Date.now()}`,
      email,
      password,
      name,
      createdAt: new Date().toISOString(),
    };

    this.data.users.push(newUser);
    await this.saveData();

    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  // User data
  getUserById(userId) {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) return null;

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser(userId, updates) {
    const userIndex = this.data.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      throw new Error("User not found");
    }

    this.data.users[userIndex] = {
      ...this.data.users[userIndex],
      ...updates,
      id: userId, // Don't allow ID change
    };

    await this.saveData();
    const { password, ...userWithoutPassword } = this.data.users[userIndex];
    return userWithoutPassword;
  }

  // Completed Hikes
  getCompletedHikes(userId) {
    return this.data.completedHikes.filter((h) => h.userId === userId);
  }

  async addCompletedHike(userId, trailId, hikeData) {
    const newHike = {
      id: `hike${Date.now()}`,
      userId,
      trailId: parseInt(trailId),
      date: hikeData.date || new Date().toISOString(),
      duration: hikeData.duration,
      notes: hikeData.notes || "",
      rating: hikeData.rating || null,
      createdAt: new Date().toISOString(),
    };

    this.data.completedHikes.push(newHike);
    await this.saveData();
    return newHike;
  }

  async deleteCompletedHike(hikeId, userId) {
    const index = this.data.completedHikes.findIndex(
      (h) => h.id === hikeId && h.userId === userId
    );

    if (index === -1) {
      throw new Error("Hike not found");
    }

    this.data.completedHikes.splice(index, 1);
    await this.saveData();
  }

  getHikeStats(userId) {
    const hikes = this.getCompletedHikes(userId);

    return {
      totalHikes: hikes.length,
      totalDuration: hikes.reduce((sum, h) => sum + (h.duration || 0), 0),
      avgRating:
        hikes.length > 0
          ? (
              hikes.reduce((sum, h) => sum + (h.rating || 0), 0) / hikes.length
            ).toFixed(1)
          : 0,
      lastHikeDate:
        hikes.length > 0
          ? hikes.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date
          : null,
    };
  }

  // Favorite Trails
  getFavoriteTrails(userId) {
    return this.data.favoriteTrails
      .filter((f) => f.userId === userId)
      .map((f) => f.trailId);
  }

  async addFavoriteTrail(userId, trailId) {
    const exists = this.data.favoriteTrails.find(
      (f) => f.userId === userId && f.trailId === parseInt(trailId)
    );

    if (exists) {
      throw new Error("Trail already in favorites");
    }

    this.data.favoriteTrails.push({
      userId,
      trailId: parseInt(trailId),
    });

    await this.saveData();
  }

  async removeFavoriteTrail(userId, trailId) {
    const index = this.data.favoriteTrails.findIndex(
      (f) => f.userId === userId && f.trailId === parseInt(trailId)
    );

    if (index === -1) {
      throw new Error("Favorite not found");
    }

    this.data.favoriteTrails.splice(index, 1);
    await this.saveData();
  }

  isFavorite(userId, trailId) {
    return this.data.favoriteTrails.some(
      (f) => f.userId === userId && f.trailId === parseInt(trailId)
    );
  }
}

export default new AuthService();
