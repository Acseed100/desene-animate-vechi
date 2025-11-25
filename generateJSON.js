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
        const epNum = parseInt(f.name.replace(/\.mp4$/i, '').trim());
        if (isNaN(epNum)) return null;
        return { ep: epNum, link: `https://drive.google.com/file/d/${f.id}/preview` };
      })
      .filter(f => f !== null)
      .sort((a,b) => a.ep - b.ep);

    output.cartoons.push({ name: c.name, episodes });
  }

  fs.writeFileSync('cartoons_generated.json', JSON.stringify(output, null, 2));
  console.log("JSON generat: cartoons_generated.json");
}

main();