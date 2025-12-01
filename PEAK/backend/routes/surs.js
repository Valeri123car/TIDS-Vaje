import express from "express";
import axios from "axios";
import { config } from "../config/config.js";

const router = express.Router();

router.get("/tourism", async (req, res) => {
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
      config.sursApiUrl
    )}`;
    const response = await axios.get(proxyUrl);

    let podatki = response.data.contents;

    const parsedData = parsePXData(podatki);

    res.json({
      success: true,
      data: parsedData,
      raw: podatki,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch SURS data",
    });
  }
});

function parsePXData(vsebina) {
  const vrstice = vsebina.split("\n");
  let dimenzije = [];
  let vrednosti = {};

  for (let i = 0; i < vrstice.length; i++) {
    const vrstica = vrstice[i].trim();

    if (vrstica.startsWith("STUB=") || vrstica.startsWith("HEADING=")) {
      const najdeno = vrstica.match(/"([^"]+)"/g);
      if (najdeno) {
        const dims = najdeno.map((s) => s.replace(/"/g, ""));
        dimenzije.push(...dims);
      }
    }

    if (vrstica.startsWith("VALUES(")) {
      const dimNajdeno = vrstica.match(/VALUES\("([^"]+)"\)/);
      if (dimNajdeno) {
        const imeDim = dimNajdeno[1];
        let celaVrstica = vrstica;

        while (!celaVrstica.includes(";")) {
          i++;
          if (i >= vrstice.length) break;
          celaVrstica += " " + vrstice[i].trim();
        }

        const vrednostiNajdeno = celaVrstica.match(/"([^"]+)"/g);
        if (vrednostiNajdeno) {
          vrednosti[imeDim] = vrednostiNajdeno
            .slice(1)
            .map((s) => s.replace(/"/g, ""));
        }
      }
    }
  }

  return {
    dimenzije,
    vrednosti,
    count: Object.keys(vrednosti).length,
  };
}

export default router;
