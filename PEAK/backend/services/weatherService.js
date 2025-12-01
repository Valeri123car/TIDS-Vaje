import axios from "axios";
import { config } from "../config/config.js";

class WeatherService {
  async getWeather(lat, lon) {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`,
        {
          params: {
            lat,
            lon,
            appid: config.weatherApiKey,
            units: "metric",
            lang: "sl",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch weather data");
    }
  }

  async getForecast(lat, lon) {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast`,
        {
          params: {
            lat,
            lon,
            appid: config.weatherApiKey,
            units: "metric",
            lang: "sl",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch forecast data");
    }
  }
}

export default new WeatherService();
