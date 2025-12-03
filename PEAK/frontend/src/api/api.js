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
  getUser: (userId) => api.get(`/auth/me/${userId}`),
  updateProfile: (userId, data) => api.put(`/auth/profile/${userId}`, data),

  getHikes: (userId) => api.get(`/auth/hikes/${userId}`),
  addHike: (hikeData) => api.post("/auth/hikes", hikeData),

  deleteHike: (hikeId, userId) =>
    api.delete(`/auth/hikes/${hikeId}`, { data: { userId } }),

  getStats: (userId) => api.get(`/auth/stats/${userId}`),

  getFavorites: (userId) => api.get(`/auth/favorites/${userId}`),
  addFavorite: (userId, trailId) =>
    api.post("/auth/favorites", { userId, trailId }),
  removeFavorite: (userId, trailId) =>
    api.delete("/auth/favorites", { data: { userId, trailId } }),
  isFavorite: (userId, trailId) =>
    api.get(`/auth/favorites/${userId}/${trailId}`),
};

export const sursAPI = {
  getTourism: () => api.get("/surs/tourism"),
  getStats: () => api.get("/surs/stats"),
};

export default api;
