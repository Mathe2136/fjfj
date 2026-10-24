(() => {
  'use strict';
  const playlistId = '1cTilm7NeUkhR1FIsdrs3t';
  const frame = document.querySelector('#spotify-player');
  const panel = document.querySelector('#player-panel');
  const trackButtons = [...document.querySelectorAll('[data-track]')];
  const playlistButton = document.querySelector('#show-playlist');
  const spotifyStatus = document.querySelector('#player-status');
  const selection = document.querySelector('#player-selection');
  const openLink = document.querySelector('#player-open');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const audio = document.querySelector('#local-audio');
  const localStatus = document.querySelector('#local-status');
  const excerptButton = document.querySelector('#play-excerpt');
  const fullButton = document.querySelector('#play-full');
  let currentTrack;
  let mode = 'excerpt';
  let ready = false;
  let pendingSeek = null;
  let internalSeek = null;
  let endTimer;
  let selectionVersion = 0;

  function timestamp(seconds) {
    const whole = Math.max(0, Math.floor(seconds));
    return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
  }

  function setMode(next) {
    mode = next;
    excerptButton.setAttribute('aria-pressed', String(mode === 'excerpt'));
    fullButton.setAttribute('aria-pressed', String(mode === 'full'));
    clearTimeout(endTimer);
  }

  function seekTo(seconds) {
    if (!ready || !Number.isFinite(audio.duration)) {
      pendingSeek = seconds;
      return;
    }
    const target = Math.max(0, Math.min(seconds, audio.duration));
    internalSeek = target;
    try { audio.currentTime = target; }
    catch { pendingSeek = target; }
  }

  function checkExcerptEnd() {
    clearTimeout(endTimer);
    if (!ready || !currentTrack || mode !== 'excerpt' || audio.paused || audio.seeking) return;
    const remaining = currentTrack.end - audio.currentTime;
    if (remaining <= .035) {
      audio.pause();
      seekTo(currentTrack.end);
      localStatus.textContent = 'Fim do nosso momento. Toque em reproduzir para ouvir de novo.';
    } else {
      // The timer checks actual media time again, so buffering never advances a fake clock.
      endTimer = window.setTimeout(checkExcerptEnd, Math.min(1000, Math.max(40, remaining * 1000 / (audio.playbackRate || 1))));
    }
  }

  function updateSpotify(type, id, title) {
    const isPlaylist = type === 'playlist';
    frame.title = isPlaylist ? 'Playlist San e Rai de Santi no Spotify' : `${title} no Spotify`;
    frame.src = `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
    selection.textContent = title;
    spotifyStatus.textContent = isPlaylist ? 'Nossa playlist completa no Spotify.' : `${title} também está disponível no Spotify. O controle do trecho está no player acima.`;
    openLink.href = `https://open.spotify.com/${type}/${id}`;
    openLink.textContent = isPlaylist ? 'Ouvir a playlist no Spotify ↗' : `Ouvir ${title} no Spotify ↗`;
  }

  function selectTrack(button, scroll = true) {
    audio.pause();
    clearTimeout(endTimer);
    selectionVersion++;
    currentTrack = {
      id: button.dataset.track,
      title: button.dataset.title,
      file: button.dataset.audio,
      start: Number(button.dataset.start),
      end: Number(button.dataset.end)
    };
    ready = false;
    internalSeek = null;
    pendingSeek = currentTrack.start;
    setMode('excerpt');
    excerptButton.disabled = fullButton.disabled = true;
    trackButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    playlistButton.setAttribute('aria-pressed', 'false');
    document.querySelector('#local-title').textContent = currentTrack.title;
    document.querySelector('#local-artist').textContent = button.querySelector('.track-info small').textContent;
    document.querySelector('#local-cover').src = button.querySelector('.track-cover').src;
    document.querySelector('#local-excerpt').textContent = button.dataset.excerpt;
    audio.setAttribute('aria-label', `${currentTrack.title}: reproduzir, pausar ou mudar o tempo`);
    localStatus.textContent = `Preparando ${currentTrack.title} em ${timestamp(currentTrack.start)}…`;
    audio.src = currentTrack.file;
    audio.load();
    updateSpotify(button.dataset.type || 'track', currentTrack.id, currentTrack.title);
    if (scroll && window.matchMedia('(max-width: 900px)').matches) panel.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  }

  audio.addEventListener('loadedmetadata', () => {
    if (!currentTrack || !Number.isFinite(audio.duration)) return;
    ready = true;
    excerptButton.disabled = fullButton.disabled = false;
    if (currentTrack.end > audio.duration) currentTrack.end = audio.duration;
    const target = pendingSeek === null ? currentTrack.start : pendingSeek;
    pendingSeek = null;
    seekTo(target);
    localStatus.textContent = `Pronto em ${timestamp(target)}. Toque em reproduzir ou arraste a barra para mudar o tempo.`;
  });

  function playFrom(nextMode, time) {
    if (!ready) return;
    setMode(nextMode);
    seekTo(time);
    const version = selectionVersion;
    const attempt = audio.play();
    if (attempt && attempt.catch) attempt.catch(error => {
      if (version === selectionVersion && error.name !== 'AbortError') localStatus.textContent = 'Toque no botão de reproduzir da barra para começar.';
    });
  }
  excerptButton.addEventListener('click', () => playFrom('excerpt', currentTrack.start));
  fullButton.addEventListener('click', () => playFrom('full', 0));
  audio.addEventListener('play', () => {
    // Reload the embedded player to stop any previous Spotify audio before local playback.
    frame.src = frame.src;
    if (ready && !audio.seeking && mode === 'excerpt' && (audio.currentTime < currentTrack.start || audio.currentTime >= currentTrack.end - .05)) seekTo(currentTrack.start);
    localStatus.textContent = mode === 'excerpt' ? `Nosso momento: ${timestamp(currentTrack.start)} a ${timestamp(currentTrack.end)}.` : 'Música inteira. Você pode avançar e voltar pela barra.';
  });
  audio.addEventListener('playing', checkExcerptEnd);
  audio.addEventListener('timeupdate', checkExcerptEnd);
  audio.addEventListener('ratechange', checkExcerptEnd);
  audio.addEventListener('pause', () => clearTimeout(endTimer));
  audio.addEventListener('waiting', () => clearTimeout(endTimer));
  audio.addEventListener('seeking', () => clearTimeout(endTimer));
  audio.addEventListener('seeked', () => {
    const programmed = internalSeek !== null && Math.abs(audio.currentTime - internalSeek) < .5;
    internalSeek = null;
    if (!programmed && currentTrack && mode === 'excerpt' && (audio.currentTime < currentTrack.start || audio.currentTime >= currentTrack.end)) {
      setMode('full');
      localStatus.textContent = 'Música inteira selecionada. Você pode mudar o tempo livremente.';
    }
    checkExcerptEnd();
  });
  audio.addEventListener('error', () => {
    ready = false;
    clearTimeout(endTimer);
    excerptButton.disabled = fullButton.disabled = true;
    localStatus.textContent = 'Não foi possível carregar o áudio. Tente escolher a música novamente ou use o Spotify abaixo.';
  });

  trackButtons.forEach(button => button.addEventListener('click', () => selectTrack(button)));
  playlistButton.addEventListener('click', () => {
    audio.pause();
    trackButtons.forEach(button => button.setAttribute('aria-pressed', 'false'));
    playlistButton.setAttribute('aria-pressed', 'true');
    updateSpotify('playlist', playlistId, 'San e Rai');
    document.querySelector('#spotify-panel').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  });
  openLink.addEventListener('click', () => audio.pause());
  window.addEventListener('blur', () => window.setTimeout(() => {
    if (document.activeElement === frame) audio.pause();
  }, 0));

  const waveToggle = document.querySelector('#wave-toggle');
  const trackList = document.querySelector('#track-list');
  waveToggle.addEventListener('click', () => {
    const paused = waveToggle.getAttribute('aria-pressed') !== 'true';
    waveToggle.setAttribute('aria-pressed', String(paused));
    waveToggle.textContent = paused ? 'Animar ondas' : 'Pausar ondas';
    trackList.classList.toggle('waves-paused', paused);
  });
  if (trackButtons.length) selectTrack(trackButtons[0], false);

  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (entry.target.animate) entry.target.animate([{ opacity: .3, transform: 'translateY(20px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 700, easing: 'cubic-bezier(.2,.7,.2,1)' });
      observer.unobserve(entry.target);
    }), { threshold: .12 });
    document.querySelectorAll('.music-copy,.album-art,.listen-heading,.listen-layout,.music-note').forEach(element => observer.observe(element));
  }
})();
