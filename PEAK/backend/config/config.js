import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  grpcPort: process.env.GRPC_PORT || 50051,
  weatherApiKey: process.env.WEATHER_API_KEY || "YOUR_API_KEY_HERE",
  sursApiUrl:
    "https://pxweb.stat.si/SiStatData/Resources/PX/Databases/Data/2974205S.px",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
};
