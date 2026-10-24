(() => {
  'use strict';
  const playlistId = '1cTilm7NeUkhR1FIsdrs3t';
  const frame = document.querySelector('#spotify-player');
  const panel = document.querySelector('#player-panel');
  const trackButtons = [...document.querySelectorAll('[data-track]')];
  const playlistButton = document.querySelector('#show-playlist');
  const status = document.querySelector('#player-status');
  const selection = document.querySelector('#player-selection');
  const openLink = document.querySelector('#player-open');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function select(type, id, title, excerpt = '') {
    const isPlaylist = type === 'playlist';
    trackButtons.forEach(button => button.setAttribute('aria-pressed', String(!isPlaylist && button.dataset.track === id)));
    playlistButton.setAttribute('aria-pressed', String(isPlaylist));
    frame.title = isPlaylist ? 'Playlist San e Rai de Santi no Spotify' : `${title} no Spotify`;
    frame.src = `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
    selection.textContent = title;
    status.textContent = isPlaylist ? 'Playlist completa selecionada. Escolha uma música no player.' : `${title} selecionada. Trecho escolhido: ${excerpt}.${type === 'album' ? ' Escolha a faixa Me Beija no player.' : ' Procure esse trecho no player.'}`;
    openLink.href = `https://open.spotify.com/${type}/${id}`;
    openLink.replaceChildren(document.createTextNode(isPlaylist ? 'Ouvir a playlist no Spotify ↗' : `Ouvir ${title} no Spotify ↗`));
    if (window.matchMedia('(max-width: 900px)').matches) panel.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  }
  trackButtons.forEach(button => button.addEventListener('click', () => select(button.dataset.type || 'track', button.dataset.track, button.dataset.title, button.dataset.excerpt)));
  playlistButton.addEventListener('click', () => select('playlist', playlistId, 'San e Rai'));

  const waveToggle = document.querySelector('#wave-toggle');
  const trackList = document.querySelector('#track-list');
  waveToggle.addEventListener('click', () => {
    const paused = waveToggle.getAttribute('aria-pressed') !== 'true';
    waveToggle.setAttribute('aria-pressed', String(paused));
    waveToggle.textContent = paused ? 'Animar ondas' : 'Pausar ondas';
    trackList.classList.toggle('waves-paused', paused);
  });

  // Decorative entrance only; playback always belongs to Spotify's own player.
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (entry.target.animate) entry.target.animate([{ opacity: .3, transform: 'translateY(20px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 700, easing: 'cubic-bezier(.2,.7,.2,1)' });
      observer.unobserve(entry.target);
    }), { threshold: .12 });
    document.querySelectorAll('.music-copy,.album-art,.listen-heading,.listen-layout,.music-note').forEach(element => observer.observe(element));
  }
})();
