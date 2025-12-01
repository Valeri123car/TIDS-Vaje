const PX_URL =
  "https://pxweb.stat.si/SiStatData/Resources/PX/Databases/Data/2974205S.px";
const USE_CSV = false;
const USE_LOCAL = false;

let vsiPodatki = [];
let filtrianiPodatki = [];
let grafi = { line: null, bar: null, pie: null };
let dimenzije = {};

window.onload = function () {
  naloziPodatke();
};

async function naloziPodatke() {
  try {
    document.getElementById("loading").style.display = "block";
    document.getElementById("content").style.display = "none";

    let podatki;

    if (USE_LOCAL) {
      const odgovor = await fetch(PX_URL);
      podatki = await odgovor.text();
      console.log("prosim delaj!");
    } else {
      const proxyUrl =
        "https://api.allorigins.win/get?url=" + encodeURIComponent(PX_URL);
      const odgovor = await fetch(proxyUrl);
      const json = await odgovor.json();
      podatki = json.contents;

      if (podatki.startsWith("data:")) {
        const base64 = podatki.split(",")[1];
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);

        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }

        const decoder = new TextDecoder("windows-1250");
        podatki = decoder.decode(bytes);

        console.log("JSON IZVEDEEEN NDELAJ PROSIM");
      }
    }

    if (USE_CSV || PX_URL.includes(".csv")) {
      vsiPodatki = parseCSV(podatki);
    } else {
      vsiPodatki = parsePX(podatki);
    }

    filtrianiPodatki = [...vsiPodatki];

    if (vsiPodatki.length > 0) {
      document.getElementById("loading").style.display = "none";
      document.getElementById("content").style.display = "block";

      narediFiltreMenu();
      pokaziStatistiko();
      naredGrafe();
    }
  } catch (napaka) {
    document.getElementById("loading").innerHTML = `
      <h2 style="color: red;">Napaka pri nalaganju</h2>
      <p>${napaka.message}</p>
      <button onclick="location.reload()" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Poskusi znova
      </button>
    `;
  }
}

function parsePX(vsebina) {
  const vrstice = vsebina.split("\n");
  let podatkovnaSekcija = "";
  let jeVPodatkih = false;
  let dimenzije = [];
  let vrednosti = {};

  for (let i = 0; i < vrstice.length; i++) {
    const vrstica = vrstice[i].trim();

    if (vrstica.startsWith("STUB=")) {
      const najdeno = vrstica.match(/"([^"]+)"/g);
      if (najdeno) {
        const dims = najdeno.map((s) => s.replace(/"/g, ""));
        dimenzije.push(...dims);
      }
    }

    if (vrstica.startsWith("HEADING=")) {
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

    if (vrstica.startsWith("DATA=")) {
      jeVPodatkih = true;
      continue;
    }

    if (jeVPodatkih) {
      if (vrstica === ";") break;
      podatkovnaSekcija += vrstica.replace(/"/g, "") + " ";
    }
  }

  const stevilke = podatkovnaSekcija
    .trim()
    .split(/\s+/)
    .map((d) => {
      if (d === "-" || d === ".." || d === '".."' || d === '"-"') return null;
      const st = parseFloat(d);
      return isNaN(st) ? null : st;
    })
    .filter((d) => d !== null);

  const rezultat = [];
  let index = 0;

  function dodajZapis(dimIndex, trenutni) {
    if (dimIndex >= dimenzije.length) {
      if (index < stevilke.length) {
        trenutni["Vrednost"] = stevilke[index];
        rezultat.push({ ...trenutni });
      }
      index++;
      return;
    }

    const imeDim = dimenzije[dimIndex];
    const vrednostiDim = vrednosti[imeDim] || [];

    vrednostiDim.forEach((val) => {
      trenutni[imeDim] = val;
      dodajZapis(dimIndex + 1, trenutni);
    });
  }

  dodajZapis(0, {});
  return rezultat;
}

function parseCSV(vsebina) {
  const vrstice = vsebina.trim().split("\n");
  const stolpci = vrstice[0]
    .split(/[,;]/)
    .map((h) => h.trim().replace(/"/g, ""));
  const rezultat = [];

  for (let i = 1; i < vrstice.length; i++) {
    const vrednosti = vrstice[i]
      .split(/[,;]/)
      .map((v) => v.trim().replace(/"/g, ""));

    if (vrednosti.length === stolpci.length) {
      const zapis = {};
      stolpci.forEach((stolpec, idx) => {
        const vrednost = vrednosti[idx];
        const stevilka = parseFloat(vrednost);
        zapis[stolpec] = isNaN(stevilka) ? vrednost : stevilka;
      });
      rezultat.push(zapis);
    }
  }

  return rezultat;
}

function narediFiltreMenu() {
  const filtersDiv = document.getElementById("filters");
  const kljuci = Object.keys(vsiPodatki[0]).filter((k) => k !== "Vrednost");

  filtersDiv.innerHTML = "";

  kljuci.forEach((kljuc) => {
    const unikatneVrednosti = [...new Set(vsiPodatki.map((r) => r[kljuc]))];
    const filterItem = document.createElement("div");
    filterItem.className = "filter-item";

    filterItem.innerHTML = `
      <label>${kljuc}</label>
      <select id="filter_${kljuc}">
        <option value="">-- Vse --</option>
        ${unikatneVrednosti
          .map((v) => `<option value="${v}">${v}</option>`)
          .join("")}
      </select>
    `;

    filtersDiv.appendChild(filterItem);
  });
}

function uporabiFiltre() {
  filtrianiPodatki = [...vsiPodatki];
  const kljuci = Object.keys(vsiPodatki[0]).filter((k) => k !== "Vrednost");

  kljuci.forEach((kljuc) => {
    const select = document.getElementById("filter_" + kljuc);
    if (select && select.value) {
      filtrianiPodatki = filtrianiPodatki.filter(
        (r) => r[kljuc] === select.value
      );
    }
  });

  pokaziStatistiko();
  naredGrafe();
}

function ponastavi() {
  filtrianiPodatki = [...vsiPodatki];
  const kljuci = Object.keys(vsiPodatki[0]).filter((k) => k !== "Vrednost");

  kljuci.forEach((kljuc) => {
    const select = document.getElementById("filter_" + kljuc);
    if (select) select.value = "";
  });

  pokaziStatistiko();
  naredGrafe();
}

function pokaziStatistiko() {
  const vrednosti = filtrianiPodatki
    .map((p) => p.Vrednost)
    .filter((v) => v != null);

  if (!vrednosti.length) {
    document.getElementById("stats").innerHTML = "<p>Ni podatkov</p>";
    return;
  }

  const vsota = vrednosti.reduce((a, b) => a + b, 0);
  const povprecje = vsota / vrednosti.length;
  const max = Math.max(...vrednosti);
  const min = Math.min(...vrednosti);

  document.getElementById("stats").innerHTML = `
    <div class="stat-card">
      <div class="stat-value">${filtrianiPodatki.length}</div>
      <div class="stat-label">Zapisov</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${povprecje.toFixed(2)}</div>
      <div class="stat-label">Povprečje</div>
    </div>
  `;
}

function naredGrafe() {
  if (!filtrianiPodatki.length) return;

  Object.values(grafi).forEach((g) => g && g.destroy());

  const kljuci = Object.keys(filtrianiPodatki[0]).filter(
    (k) => k !== "Vrednost"
  );
  const kategorijaKljuc = kljuci[0];

  const agregirano = {};
  filtrianiPodatki.forEach((vrstica) => {
    const kat = vrstica[kategorijaKljuc];
    if (!agregirano[kat]) agregirano[kat] = [];
    agregirano[kat].push(vrstica.Vrednost);
  });

  const labele = Object.keys(agregirano);
  const vrednosti = labele.map((l) => {
    const arr = agregirano[l];
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  });

  const lineCtx = document.getElementById("lineChart").getContext("2d");
  grafi.line = new Chart(lineCtx, {
    type: "line",
    data: {
      labels: labele,
      datasets: [
        {
          label: "Vrednost",
          data: vrednosti,
          borderColor: "rgba(0, 0, 0, 1)",
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          borderWidth: 3,
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: { responsive: true, maintainAspectRatio: true },
  });

  const barCtx = document.getElementById("barChart").getContext("2d");
  grafi.bar = new Chart(barCtx, {
    type: "bar",
    data: {
      labels: labele.slice(0, 20),
      datasets: [
        {
          label: "Vrednost",
          data: vrednosti.slice(0, 20),
          backgroundColor: "rgba(0, 0, 0, 0.8)",
        },
      ],
    },
    options: { responsive: true, maintainAspectRatio: true },
  });

  const pieCtx = document.getElementById("pieChart").getContext("2d");
  grafi.pie = new Chart(pieCtx, {
    type: "pie",
    data: {
      labels: labele.slice(0, 8),
      datasets: [
        {
          data: vrednosti.slice(0, 8),
          backgroundColor: [
            "red",
            "blue",
            "cyan",
            "black",
            "green",
            "yellow",
            "orange",
            "gray",
          ],
        },
      ],
    },
    options: { responsive: true, maintainAspectRatio: true },
  });
}

function prikaziGrafe() {
  naredGrafe();
}

function izvozCSV() {
  if (!filtrianiPodatki.length) return;

  const kljuci = Object.keys(filtrianiPodatki[0]);
  let csv = kljuci.join(",") + "\n";

  filtrianiPodatki.forEach((vrstica) => {
    csv += kljuci.map((k) => vrstica[k]).join(",") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "surs_podatki.csv";
  a.click();
}
