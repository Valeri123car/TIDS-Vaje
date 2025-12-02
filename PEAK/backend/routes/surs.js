import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Path to local PX file
const PX_FILE_PATH = path.join(__dirname, "../data/planinske_koca.px");

// Get SURS/PZS tourism data with real PX parsing
router.get("/tourism", async (req, res) => {
  try {
    console.log("📡 Reading PX data from local file...");

    // Read PX file from disk
    const pxData = fs.readFileSync(PX_FILE_PATH, "utf-8");
    console.log("✅ PX data loaded, size:", pxData.length, "bytes");

    // Parse PX data
    const parsedData = parsePXData(pxData);
    console.log("✅ PX data parsed successfully");
    console.log("📊 Dimenzije:", parsedData.dimenzije);
    console.log(
      "📊 Število vrednosti:",
      Object.keys(parsedData.vrednosti).length
    );

    // Calculate statistics from real data
    const stats = calculateStats(parsedData);

    res.json({
      success: true,
      data: {
        dimenzije: parsedData.dimenzije,
        vrednosti: parsedData.vrednosti,
        povzetek: stats,
        opis: "Podatki o planinskih kočah v Sloveniji - PZS",
      },
      source: "PZS - Planinska zveza Slovenije (mapzs.pzs.si)",
      note: "Podatki pridobljeni iz PX formata in parseani",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ PX Parse Error:", error.message);

    res.status(500).json({
      success: false,
      error: "Failed to parse PX data: " + error.message,
    });
  }
});

// PX Data Parser
function parsePXData(pxContent) {
  const lines = pxContent.split("\n");
  let dimenzije = [];
  let vrednosti = {};
  let dataValues = [];
  let inDataSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Parse STUB (row dimensions)
    if (line.startsWith("STUB=")) {
      const matches = line.match(/"([^"]+)"/g);
      if (matches) {
        dimenzije.push(...matches.map((s) => s.replace(/"/g, "")));
      }
    }

    // Parse HEADING (column dimensions)
    if (line.startsWith("HEADING=")) {
      const matches = line.match(/"([^"]+)"/g);
      if (matches) {
        dimenzije.push(...matches.map((s) => s.replace(/"/g, "")));
      }
    }

    // Parse VALUES
    if (line.startsWith("VALUES(")) {
      const dimMatch = line.match(/VALUES\("([^"]+)"\)/);
      if (dimMatch) {
        const dimName = dimMatch[1];
        let fullLine = line;

        // Read multi-line values
        while (!fullLine.includes(";")) {
          i++;
          if (i >= lines.length) break;
          fullLine += " " + lines[i].trim();
        }

        const valueMatches = fullLine.match(/"([^"]+)"/g);
        if (valueMatches) {
          vrednosti[dimName] = valueMatches
            .slice(1)
            .map((s) => s.replace(/"/g, ""));
        }
      }
    }

    // Parse DATA section
    if (line.startsWith("DATA=")) {
      inDataSection = true;
      continue;
    }

    if (inDataSection) {
      if (line === ";") break;

      // Extract numbers from data section
      const numbers = line
        .split(/\s+/)
        .map((d) => {
          if (d === "-" || d === ".." || d === "" || d === "DATA=") return null;
          const num = parseFloat(d);
          return isNaN(num) ? null : num;
        })
        .filter((d) => d !== null);

      dataValues.push(...numbers);
    }
  }

  console.log("📊 Parsed data values:", dataValues.length);

  // Split data by years and types (2 types per year: prenočitve, obiskovalci)
  // We have 4 years * 2 types = 8 columns
  // Each row is: [2021_pren, 2021_obis, 2022_pren, 2022_obis, 2023_pren, 2023_obis, 2024_pren, 2024_obis]

  const prenocitveSample = [];
  const obiskovalciSample = [];

  // Extract prenočitve (odd indices: 0, 2, 4, 6) and obiskovalci (even indices: 1, 3, 5, 7)
  for (let i = 0; i < dataValues.length; i += 8) {
    // Get average of all years for prenočitve
    const avgPren = Math.round(
      (dataValues[i] +
        dataValues[i + 2] +
        dataValues[i + 4] +
        dataValues[i + 6]) /
        4
    );
    prenocitveSample.push(avgPren);
  }

  // Limit to 20 koče
  if (prenocitveSample.length > 20) {
    console.log(`⚠️  Skrajšujem podatke: ${prenocitveSample.length} → 20`);
    vrednosti["Planinska koča"] = vrednosti["Planinska koča"].slice(0, 20);
  }

  vrednosti["Število prenočitev"] = prenocitveSample.slice(0, 20);

  return {
    dimenzije: dimenzije,
    vrednosti: vrednosti,
    count: Object.keys(vrednosti).length,
  };
}

// Calculate statistics
function calculateStats(parsedData) {
  const prenocitveSample = parsedData.vrednosti["Število prenočitev"] || [];
  const koce = parsedData.vrednosti["Planinska koča"] || [];
  const regije = parsedData.vrednosti["Planinska regija"] || [];

  if (prenocitveSample.length === 0) {
    return {
      skupno_prenočitev: 0,
      povprečje_na_kočo: 0,
      top_koča: koce[0] || "N/A",
      število_koč: koce.length,
    };
  }

  const total = prenocitveSample.reduce((a, b) => a + b, 0);
  const average = Math.round(total / prenocitveSample.length);
  const maxPren = Math.max(...prenocitveSample);
  const maxIndex = prenocitveSample.indexOf(maxPren);

  return {
    skupno_prenočitev: total,
    povprečje_na_kočo: average,
    top_koča: koce[maxIndex] || koce[0] || "N/A",
    število_koč: koce.length,
    število_regij: regije.length,
  };
}

// Get tourism statistics summary
router.get("/stats", (req, res) => {
  try {
    const pxData = fs.readFileSync(PX_FILE_PATH, "utf-8");
    const parsedData = parsePXData(pxData);
    const stats = calculateStats(parsedData);

    res.json({
      success: true,
      stats: stats,
      koce: parsedData.vrednosti["Planinska koča"] || [],
      regije: parsedData.vrednosti["Planinska regija"] || [],
    });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get statistics",
    });
  }
});

export default router;
