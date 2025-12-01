import { weatherAPI } from "./api";

export const getWeatherForTrail = async (trail) => {
  if (!trail.izhod_koordinate) {
    return null;
  }

  try {
    const coords = trail.izhod_koordinate
      .split(",")
      .map((c) => parseFloat(c.trim()));
    if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) {
      return null;
    }

    const response = await weatherAPI.getCurrent(coords[0], coords[1]);
    return {
      temp: response.data.main.temp,
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
    };
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    return null;
  }
};

export const getWeatherIcon = (iconCode) => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};
