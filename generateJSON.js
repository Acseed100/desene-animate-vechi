const fs = require('fs');
const fetch = require('node-fetch'); // npm install node-fetch@2
const apiKey = 'AIzaSyCIGSwepjJyhMS39S1aDC0ShgGWZbPasUg';

// Citim JSON-ul cu linkurile desenelor
const raw = fs.readFileSync('cartoons_links.json');
const cartoonsLinks = JSON.parse(raw);

// Extragem ID-ul folderului din link
function getFolderId(url) {
  const match = url.match(/folders\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

// Functie pentru a prelua toate fișierele dintr-un folder cu paginare
async function getAllFiles(folderId) {
  let files = [];
  let pageToken = '';
  
  do {
    const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${apiKey}&fields=nextPageToken,files(id,name)&pageToken=${pageToken}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.files) files = files.concat(data.files);
    pageToken = data.nextPageToken || '';
  } while (pageToken);
  
  return files;
}

async function main() {
  const output = { cartoons: [] };

  for (const c of cartoonsLinks) {
    const folderId = getFolderId(c.url);
    if (!folderId) {
      console.log(`Invalid URL for ${c.name}`);
      continue;
    }

    console.log(`Processing ${c.name}...`);
    const files = await getAllFiles(folderId);

    const episodes = files
      .map(f => {
        const nameWithoutExt = f.name.replace(/\.mp4$/i, '').trim();

        let epNum = null;
        let title = '';

        // Caz 1: începe cu număr și eventual titlu: 1 sau 1. Titlu
        const match1 = nameWithoutExt.match(/^(\d+)(?:\.\s*(.*))?$/);
        if (match1) {
          epNum = parseInt(match1[1]);
          title = match1[2] ? match1[2] : `Ep. ${epNum}`;
        } else {
          // Caz 2: nu începe cu număr, doar titlu
          epNum = null;
          title = nameWithoutExt; 
        }

        const link = `https://drive.google.com/file/d/${f.id}/preview`;

        return { ep: epNum, title, link };
      })
      .filter(f => f !== null)
      .sort((a,b) => {
        // sortăm după număr dacă există, altfel rămâne la sfârșit
        if (a.ep !== null && b.ep !== null) return a.ep - b.ep;
        if (a.ep !== null) return -1;
        if (b.ep !== null) return 1;
        return 0;
      });

    output.cartoons.push({ name: c.name, episodes });
  }

  fs.writeFileSync('cartoons_generated.json', JSON.stringify(output, null, 2));
  console.log("JSON generat: cartoons_generated.json");
}

main();
