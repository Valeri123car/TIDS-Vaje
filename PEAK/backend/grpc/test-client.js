import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

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

const client = new hikingProto.HikingService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

console.log("🚀 Testing gRPC Server...\n");

// Test 1: Get Trail
console.log("📍 Test 1: GetTrail");
client.GetTrail({ id: "1" }, (err, response) => {
  if (err) {
    console.error("❌ Error:", err.message);
  } else {
    console.log("✅ Response:", response);
  }
});

// Test 2: Get All Trails
setTimeout(() => {
  console.log("\n📍 Test 2: GetAllTrails (Pohorje region)");
  client.GetAllTrails({ region: "Pohorje" }, (err, response) => {
    if (err) {
      console.error("❌ Error:", err.message);
    } else {
      console.log("✅ Response:", response);
    }
  });
}, 1000);

// Test 3: Add Hike
setTimeout(() => {
  console.log("\n📍 Test 3: AddHike");
  client.AddHike(
    {
      userId: "testuser",
      trailId: "2",
      duration: 120,
    },
    (err, response) => {
      if (err) {
        console.error("❌ Error:", err.message);
      } else {
        console.log("✅ Response:", response);
      }
    }
  );
}, 2000);

// Test 4: Stream Trails
setTimeout(() => {
  console.log("\n📍 Test 4: StreamTrails (easy difficulty)");
  const call = client.StreamTrails({ difficulty: "easy" });

  call.on("data", (trail) => {
    console.log("✅ Streamed trail:", trail);
  });

  call.on("end", () => {
    console.log("✅ Streaming finished");
    process.exit(0);
  });

  call.on("error", (err) => {
    console.error("❌ Streaming error:", err.message);
  });
}, 3000);
