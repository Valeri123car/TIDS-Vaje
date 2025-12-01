const loadBtn = document.querySelector(".loadBtn");
const filterSelect = document.querySelector(".filter");
const filterInput = document.querySelector(".filterInput");
const filterBtn = document.querySelector(".filterBtn");
const exportJsonBtn = document.querySelector(".exportJson");
const exportXmlBtn = document.querySelector(".exportXml");
const output = document.querySelector(".output");

let artikli = [];
let dobavitelji = [];
let narocila = [];
let filtriraniPodatki = [];

async function preberXML(url) {
  const response = await fetch(url);
  const text = await response.text();
  const parser = new DOMParser();
  return parser.parseFromString(text, "application/xml");
}

async function naloziPodatke() {
  const xmlArtikli = await preberXML("./data/artikli.xml");
  const xmlDobavitelji = await preberXML("./data/dobavitelji.xml");
  const xmlNarocila = await preberXML("./data/narocila.xml");

  artikli = Array.from(xmlArtikli.getElementsByTagName("artikle")).map(
    (el) => ({
      id: el.getAttribute("id_artikla"),
      ime: el.querySelector("ime_artikla")?.textContent ?? "",
      stevilo_kock: el.querySelector("stevilo_kock")?.textContent ?? "",
      starost: el.querySelector("starost")?.textContent ?? "",
      cena: el.querySelector("cena")?.textContent ?? "",
      zaloga: el.querySelector("zaloga")?.textContent ?? "",
    })
  );
  console.log("tole so artikli", artikli);

  dobavitelji = Array.from(
    xmlDobavitelji.getElementsByTagName("dobavitelj")
  ).map((el) => ({
    id: el.getAttribute("id_dobavitelja"),
    ime: el.querySelector("ime")?.textContent ?? "",
    lokacija: el.querySelector("lokacija")?.textContent ?? "",
    razdalja: el.querySelector("razdalja")?.textContent ?? "",
  }));
  console.log("tole so dobavitelji", dobavitelji);

  narocila = Array.from(xmlNarocila.getElementsByTagName("narocilo")).map(
    (el) => ({
      id: el.getAttribute("id_narocila"),
      datum: el.getAttribute("datum"),
      id_artikla: el.querySelector("artikelRef")?.getAttribute("id_artikla"),
      id_dobavitelja: el
        .querySelector("dobaviteljRef")
        ?.getAttribute("id_dobavitelja"),
    })
  );
  console.log("tole so narocila", narocila);
}

loadBtn.addEventListener("click", naloziPodatke);

function filtriraj(kriterji, vrednost) {
  var rezultat = [];
  if (kriterji === "zaloga") {
    for (var i = 0; i < narocila.length; i++) {
      var n = narocila[i];
      var artikel = null;
      for (var j = 0; j < artikli.length; j++) {
        if (artikli[j].id == n.id_artikla) {
          artikel = artikli[j];
          break;
        }
      }
      if (artikel && artikel.zaloga < 5) {
        var dobavitelj = null;
        for (var k = 0; k < dobavitelji.length; k++) {
          if (dobavitelji[k].id === n.id_dobavitelja) {
            dobavitelj = dobavitelji[k];
            break;
          }
        }
        rezultat.push({
          narocilo: n,
          artikel: artikel,
          dobavitelj: dobavitelj,
        });
      }
    }
  } else if (kriterji === "dobavitelj") {
    for (var i = 0; i < narocila.length; i++) {
      var n = narocila[i];
      if (n.id_dobavitelja === vrednost) {
        var artikel = null;
        for (var j = 0; j < artikli.length; j++) {
          if (artikli[j].id === n.id_artikla) {
            artikel = artikli[j];
            break;
          }
        }
        var dobavitelj = null;
        for (var k = 0; k < dobavitelji.length; k++) {
          if (dobavitelji[k].id === n.id_dobavitelja) {
            dobavitelj = dobavitelji[k];
            break;
          }
        }
        rezultat.push({
          narocilo: n,
          artikel: artikel,
          dobavitelj: dobavitelj,
        });
      }
    }
  } else if (kriterji === "datum") {
    for (var i = 0; i < narocila.length; i++) {
      var n = narocila[i];
      if (n.datum >= vrednost) {
        var artikel = null;
        for (var j = 0; j < artikli.length; j++) {
          if (artikli[j].id === n.id_artikla) {
            artikel = artikli[j];
            break;
          }
        }
        var dobavitelj = null;
        for (var k = 0; k < dobavitelji.length; k++) {
          if (dobavitelji[k].id === n.id_dobavitelja) {
            dobavitelj = dobavitelji[k];
            break;
          }
        }
        rezultat.push({
          narocilo: n,
          artikel: artikel,
          dobavitelj: dobavitelj,
        });
      }
    }
  }
  filtriraniPodatki = rezultat;

  prikaziRezultat(rezultat);
}

/*
to kodo je naredu chat krajšo od une zgornje 
function filtriraj(kriterij, vrednost) { 
  // Prazno polje za rezultate
  const rezultat = [];

  // Gremo skozi vsa naročila
  narocila.forEach(narocilo => {
    const artikel = artikli.find(a => a.id === narocilo.id_artikla);
    const dobavitelj = dobavitelji.find(d => d.id === narocilo.id_dobavitelja);

    if (!artikel || !dobavitelj) return; // preskoči, če artikel ali dobavitelj ne obstaja

    // Filtriranje po kriteriju
    if (
      (kriterij === "zaloga" && Number(artikel.zaloga) < 5) ||
      (kriterij === "dobavitelj" && narocilo.id_dobavitelja === vrednost) ||
      (kriterij === "datum" && narocilo.datum >= vrednost)
    ) {
      rezultat.push({ narocilo, artikel, dobavitelj });
    }
  });

  // Shrani in prikaži rezultat
  filtriraniPodatki = rezultat;
  prikaziRezultat(rezultat);
}*/

function prikaziRezultat(seznam) {
  if (seznam.length === 0) {
    output.textContent = "Ni rezultatov za izbrani filter.";
    return;
  }

  var text = "";
  for (var i = 0; i < seznam.length; i++) {
    var n = seznam[i];
    text += "Naročilo ID: " + n.narocilo.id + "\n";
    text += "Datum: " + n.narocilo.datum + "\n";
    text +=
      "Artikel: " +
      (n.artikel ? n.artikel.ime : "Ni podatka") +
      " (" +
      (n.artikel ? n.artikel.stevilo_kock : "?") +
      ")\n";
    text +=
      "Dobavitelj: " + (n.dobavitelj ? n.dobavitelj.ime : "Ni podatka") + "\n";
    text += "---------------------------\n";
  }

  output.textContent = text;
}

filterBtn.addEventListener("click", function () {
  var kriterij = filterSelect.value;
  var vrednost = filterInput.value.trim();
  filtriraj(kriterij, vrednost);
});

function prenesiDatoteko(vsebina, imeDatoteke, tipDatoteke) {
  const blob = new Blob([vsebina], { type: tipDatoteke });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = imeDatoteke;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

exportJsonBtn.addEventListener("click", function () {
  if (filtriraniPodatki.length === 0) {
    alert("Ni podatkov za izvoz. Najprej filtrirajte podatke.");
    return;
  }

  const jsonPodatki = filtriraniPodatki.map((zapis) => ({
    narocilo: {
      id: zapis.narocilo.id,
      datum: zapis.narocilo.datum,
    },
    artikel: zapis.artikel
      ? {
          id: zapis.artikel.id,
          ime: zapis.artikel.ime,
          stevilo_kock: zapis.artikel.stevilo_kock,
          starost: zapis.artikel.starost,
          cena: zapis.artikel.cena,
          zaloga: zapis.artikel.zaloga,
        }
      : null,
    dobavitelj: zapis.dobavitelj
      ? {
          id: zapis.dobavitelj.id,
          ime: zapis.dobavitelj.ime,
          lokacija: zapis.dobavitelj.lokacija,
          razdalja: zapis.dobavitelj.razdalja,
        }
      : null,
  }));

  const jsonString = JSON.stringify(jsonPodatki, null, 2);
  prenesiDatoteko(jsonString, "filtrirano.json", "application/json");
});

exportXmlBtn.addEventListener("click", function () {
  if (filtriraniPodatki.length === 0) {
    alert("Ni podatkov za izvoz. Najprej filtrirajte podatke.");
    return;
  }

  var xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xmlString += "<filtrirani_rezultati>\n";

  for (var i = 0; i < filtriraniPodatki.length; i++) {
    var zapis = filtriraniPodatki[i];

    xmlString += "  <rezultat>\n";

    xmlString +=
      '    <narocilo id_narocila="' +
      zapis.narocilo.id +
      '" datum="' +
      zapis.narocilo.datum +
      '">\n';
    xmlString += "    </narocilo>\n";

    if (zapis.artikel) {
      xmlString += '    <artikel id_artikla="' + zapis.artikel.id + '">\n';
      xmlString +=
        "      <ime_artikla>" + zapis.artikel.ime + "</ime_artikla>\n";
      xmlString +=
        "      <stevilo_kock>" +
        zapis.artikel.stevilo_kock +
        "</stevilo_kock>\n";
      xmlString += "      <starost>" + zapis.artikel.starost + "</starost>\n";
      xmlString += "      <cena>" + zapis.artikel.cena + "</cena>\n";
      xmlString += "      <zaloga>" + zapis.artikel.zaloga + "</zaloga>\n";
      xmlString += "    </artikel>\n";
    }

    if (zapis.dobavitelj) {
      xmlString +=
        '    <dobavitelj id_dobavitelja="' + zapis.dobavitelj.id + '">\n';
      xmlString += "      <ime>" + zapis.dobavitelj.ime + "</ime>\n";
      xmlString +=
        "      <lokacija>" + zapis.dobavitelj.lokacija + "</lokacija>\n";
      xmlString +=
        "      <razdalja>" + zapis.dobavitelj.razdalja + "</razdalja>\n";
      xmlString += "    </dobavitelj>\n";
    }

    xmlString += "  </rezultat>\n";
  }

  xmlString += "</filtrirani_rezultati>";

  prenesiDatoteko(xmlString, "filtrirano.xml", "application/xml");
});
