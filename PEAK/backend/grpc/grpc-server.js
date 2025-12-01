import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { config } from "../config/config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROTO_PATH = join(__dirname, "hiking.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const hikingProto = protoDescriptor.hiking;

// Mock data
const trails = [
  {
    id: "1",
    name: "Triglav",
    difficulty: "Zelo zahtevna",
    length: 15,
    region: "Julijske Alpe",
    ascent: 1600,
  },
  {
    id: "2",
    name: "Storžič",
    difficulty: "Zahtevna",
    length: 8,
    region: "Kamniške Alpe",
    ascent: 1200,
  },
  {
    id: "3",
    name: "Pohorje trail",
    difficulty: "Lahka",
    length: 5,
    region: "Pohorje",
    ascent: 300,
  },
  {
    id: "4",
    name: "Velika planina",
    difficulty: "Lahka",
    length: 10,
    region: "Kamniške Alpe",
    ascent: 600,
  },
  {
    id: "5",
    name: "Krvavec",
    difficulty: "Srednja",
    length: 8,
    region: "Kamniške Alpe",
    ascent: 800,
  },
];

const hikes = [];
let hikeId = 1;

function getTrail(call, callback) {
  const trail = trails.find((t) => t.id === call.request.id);
  callback(null, {
    trail: trail || null,
    message: trail ? "Trail found" : "Trail not found",
  });
}

function addHike(call, callback) {
  const newHike = {
    id: String(hikeId++),
    userId: call.request.userId,
    trailId: call.request.trailId,
    date: new Date().toISOString().split("T")[0],
    duration: call.request.duration,
    notes: call.request.notes || "",
  };

  hikes.push(newHike);

  callback(null, {
    hike: newHike,
    message: "Hike added successfully",
  });
}

function getAllTrails(call, callback) {
  let result = trails;

  if (call.request.region && call.request.region !== "") {
    result = trails.filter((t) => t.region === call.request.region);
  }

  callback(null, {
    trails: result,
    count: result.length,
  });
}

function getUserHikes(call, callback) {
  const userHikes = hikes.filter((h) => h.userId === call.request.userId);

  callback(null, {
    hikes: userHikes,
    total: userHikes.length,
  });
}

function streamTrails(call) {
  const difficultyFilter = call.request.difficulty;

  let result = trails;
  if (difficultyFilter && difficultyFilter !== "") {
    result = trails.filter((t) => t.difficulty === difficultyFilter);
  }

  let i = 0;
  const interval = setInterval(() => {
    if (i < result.length) {
      call.write(result[i]);
      i++;
    } else {
      clearInterval(interval);
      call.end();
    }
  }, 1000);
}

const server = new grpc.Server();

server.addService(hikingProto.HikingService.service, {
  GetTrail: getTrail,
  AddHike: addHike,
  GetAllTrails: getAllTrails,
  GetUserHikes: getUserHikes,
  StreamTrails: streamTrails,
});

server.bindAsync(
  `0.0.0.0:${config.grpcPort}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error("Error starting gRPC server:", err);
      return;
    }
    console.log(`✅ gRPC server running on port ${port}`);
  }
);
