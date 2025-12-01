const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "hiking.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const hikingProto = protoDescriptor.hiking;

const trails = [
  {
    id: "1",
    name: "Pohorje trail",
    difficulty: "easy",
    length: 5,
    region: "Pohorje",
  },
  {
    id: "2",
    name: "Triglav path",
    difficulty: "hard",
    length: 15,
    region: "Julian Alps",
  },
  {
    id: "3",
    name: "Krvavec loop",
    difficulty: "medium",
    length: 8,
    region: "Kamnik Alps",
  },
  {
    id: "4",
    name: "Logarska dolina",
    difficulty: "easy",
    length: 6,
    region: "Savinja Alps",
  },
  {
    id: "5",
    name: "Velika planina",
    difficulty: "medium",
    length: 10,
    region: "Kamnik Alps",
  },
];

const hikes = [];
let hikeId = 1;

function getTrail(call, callback) {
  const trailId = call.request.id;
  const trail = trails.find((t) => t.id === trailId);

  if (trail) {
    callback(null, {
      trail: trail,
      message: "Trail found",
    });
  } else {
    callback(null, {
      trail: null,
      message: "Trail not found",
    });
  }
}

function addHike(call, callback) {
  const newHike = {
    id: String(hikeId++),
    userId: call.request.userId,
    trailId: call.request.trailId,
    date: new Date().toISOString().split("T")[0],
    duration: call.request.duration,
  };

  hikes.push(newHike);

  callback(null, {
    hike: newHike,
    message: "Hike added successfully",
  });
}

function getAllTrails(call, callback) {
  const regionFilter = call.request.region;

  let result = trails;
  if (regionFilter && regionFilter !== "") {
    result = trails.filter((t) => t.region === regionFilter);
  }

  callback(null, {
    trails: result,
    count: result.length,
  });
}

function getUserHikes(call, callback) {
  const userId = call.request.userId;
  const userHikes = hikes.filter((h) => h.userId === userId);

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

function getServer() {
  const server = new grpc.Server();
  server.addService(hikingProto.HikingService.service, {
    GetTrail: getTrail,
    AddHike: addHike,
    GetAllTrails: getAllTrails,
    GetUserHikes: getUserHikes,
    StreamTrails: streamTrails,
  });
  return server;
}

const server = getServer();
server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error("Error starting server:", err);
      return;
    }
    console.log(`Server running on port ${port}`);
    server.start();
  }
);
