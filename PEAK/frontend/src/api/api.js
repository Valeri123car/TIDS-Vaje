import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Trails API
export const trailsAPI = {
  getAll: () => api.get("/trails"),
  getById: (id) => api.get(`/trails/${id}`),
  filter: (filters) => api.post("/trails/filter", filters),
  getStats: () => api.get("/trails/stats/all"),
  getRegions: () => api.get("/trails/meta/regions"),
  getDifficulties: () => api.get("/trails/meta/difficulties"),
};

// Weather API
export const weatherAPI = {
  getCurrent: (lat, lon) => api.get(`/weather?lat=${lat}&lon=${lon}`),
  getForecast: (lat, lon) => api.get(`/weather/forecast?lat=${lat}&lon=${lon}`),
};

// Auth API
export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (name, email, password) =>
    api.post("/auth/register", { name, email, password }),
  getProfile: (userId) => api.get(`/auth/me/${userId}`),
  updateProfile: (userId, updates) =>
    api.put(`/auth/profile/${userId}`, updates),

  // Hikes
  getHikes: (userId) => api.get(`/auth/hikes/${userId}`),
  addHike: (userId, trailId, hikeData) =>
    api.post("/auth/hikes", { userId, trailId, ...hikeData }),
  deleteHike: (hikeId, userId) =>
    api.delete(`/auth/hikes/${hikeId}`, { data: { userId } }),
  getStats: (userId) => api.get(`/auth/stats/${userId}`),

  // Favorites
  getFavorites: (userId) => api.get(`/auth/favorites/${userId}`),
  addFavorite: (userId, trailId) =>
    api.post("/auth/favorites", { userId, trailId }),
  removeFavorite: (userId, trailId) =>
    api.delete("/auth/favorites", { data: { userId, trailId } }),
  isFavorite: (userId, trailId) =>
    api.get(`/auth/favorites/${userId}/${trailId}`),
};

// SURS API
export const sursAPI = {
  getTourism: () => api.get("/surs/tourism"),
};

export default api;
