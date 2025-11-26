// Load JSON
fetch('cartoons_generated.json')
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById('cartoon-list');
    data.cartoons.forEach(c => {
      const div = document.createElement('div');
      div.className = 'cartoon';
      div.innerText = c.name;
      div.onclick = () => openEpisodes(c);
      list.appendChild(div);
    });
  });

function openEpisodes(cartoon) {
  document.getElementById('modal-title').innerText = cartoon.name;
  const epList = document.getElementById('episode-list');
  epList.innerHTML = '';

  cartoon.episodes.forEach(ep => {
    const b = document.createElement('div');
    b.className = 'ep-btn';
    b.innerText = ep.title || ('Ep. ' + ep.ep);
    b.onclick = () => openVideo(ep.link);
    epList.appendChild(b);
  });

  document.getElementById('episode-modal-bg').style.display = 'flex';
}

function closeEpisodeModal() {
  document.getElementById('episode-modal-bg').style.display = 'none';
}

function openVideo(link) {
  document.getElementById('video-frame').src = link;
  document.getElementById('video-overlay-bg').style.display = 'flex';
}

function closeVideo() {
  document.getElementById('video-overlay-bg').style.display = 'none';
  document.getElementById('video-frame').src = '';
}