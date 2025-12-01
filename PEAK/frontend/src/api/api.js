import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const trailsAPI = {
  getAll: () => api.get("/trails"),
  getById: (id) => api.get(`/trails/${id}`),
  filter: (filters) => api.post("/trails/filter", filters),
  getStats: () => api.get("/trails/stats/all"),
  getRegions: () => api.get("/trails/meta/regions"),
  getDifficulties: () => api.get("/trails/meta/difficulties"),
};

export const weatherAPI = {
  getCurrent: (lat, lon) => api.get(`/weather?lat=${lat}&lon=${lon}`),
  getForecast: (lat, lon) => api.get(`/weather/forecast?lat=${lat}&lon=${lon}`),
};

export const sursAPI = {
  getTourism: () => api.get("/surs/tourism"),
};

export const userAPI = {
  getProfile: (userId) => api.get(`/user/profile/${userId}`),
  updateProfile: (userData) => api.post("/user/profile", userData),
  getHikes: (userId) => api.get(`/user/hikes/${userId}`),
  addHike: (hikeData) => api.post("/user/hikes", hikeData),
  deleteHike: (hikeId) => api.delete(`/user/hikes/${hikeId}`),
  getStats: (userId) => api.get(`/user/stats/${userId}`),
};

export default api;
