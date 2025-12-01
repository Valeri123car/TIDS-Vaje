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

const client = new hikingProto.HikingService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

function getTrail(trailId) {
  console.log("\n--- GetTrail ---");
  client.GetTrail({ id: trailId }, (err, response) => {
    if (err) {
      console.error("Error:", err);
    } else {
      console.log("Message:", response.message);
      if (response.trail) {
        console.log("Trail:", response.trail);
      }
    }
  });
}

function addHike(userId, trailId, duration) {
  console.log("\n--- AddHike ---");
  client.AddHike(
    {
      userId: userId,
      trailId: trailId,
      duration: duration,
    },
    (err, response) => {
      if (err) {
        console.error("Error:", err);
      } else {
        console.log("Message:", response.message);
        console.log("Hike:", response.hike);
      }
    }
  );
}

function getAllTrails(region = "") {
  console.log("\n--- GetAllTrails ---");
  client.GetAllTrails({ region: region }, (err, response) => {
    if (err) {
      console.error("Error:", err);
    } else {
      console.log("Count:", response.count);
      console.log("Trails:", response.trails);
    }
  });
}

function getUserHikes(userId) {
  console.log("\n--- GetUserHikes ---");
  client.GetUserHikes({ userId: userId }, (err, response) => {
    if (err) {
      console.error("Error:", err);
    } else {
      console.log("Total hikes:", response.total);
      console.log("Hikes:", response.hikes);
    }
  });
}

function streamTrails(difficulty = "") {
  console.log("\n--- StreamTrails ---");
  const call = client.StreamTrails({ difficulty: difficulty });

  call.on("data", (trail) => {
    console.log("Received trail:", trail);
  });

  call.on("end", () => {
    console.log("Streaming finished");
  });

  call.on("error", (err) => {
    console.error("Streaming error:", err);
  });
}

console.log("=== Testing gRPC client ===");

setTimeout(() => {
  getTrail("1");

  setTimeout(() => {
    addHike("user1", "2", 180);
  }, 1000);

  setTimeout(() => {
    getAllTrails("Pohorje");
  }, 2000);

  setTimeout(() => {
    getUserHikes("user1");
  }, 3000);

  setTimeout(() => {
    streamTrails("easy");
  }, 4000);
}, 1000);
