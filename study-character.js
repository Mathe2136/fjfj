(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let state = 'idle', paused = false;
  const widget = document.createElement('aside');
  widget.className = 'study-pet';
  widget.setAttribute('aria-label', 'Atalho de estudos — prévia');
  widget.innerHTML = '<a class="study-pet-link" href="estudos.html#estudos"><span class="pet-media"></span><span>Prévia de estudos</span></a><button class="pet-pause" type="button">Pausar animação</button>';
  document.body.append(widget);
  const collapse = document.createElement('button');
  collapse.type = 'button'; collapse.className = 'pet-collapse'; collapse.textContent = 'Recolher'; collapse.setAttribute('aria-expanded','true'); widget.append(collapse);
  let collapsed = false;
  collapse.addEventListener('click', () => { collapsed = !collapsed; widget.classList.toggle('is-collapsed', collapsed); collapse.textContent = collapsed ? 'Ver personagem' : 'Recolher'; collapse.setAttribute('aria-expanded',String(!collapsed)); updatePlayback(); });
  const toggle = widget.querySelector('.pet-pause');
  const link = widget.querySelector('a');
  const slot = document.querySelector('.study-character-slot');
  const targets = [widget.querySelector('.pet-media'), ...(slot ? [slot] : [])];
  function updatePlayback() {
    const still = paused || reduced.matches || document.hidden || collapsed;
    toggle.textContent = paused ? 'Animar personagem' : 'Pausar animação';
    toggle.hidden = reduced.matches || state !== 'active';
    toggle.setAttribute('aria-pressed', String(paused));
    targets.forEach(target => {
      const video = target.querySelector('video'), img = target.querySelector('img');
      if (!video) return;
      video.hidden = still; img.hidden = !still;
      if (still) video.pause();
      else video.play().catch(() => { video.hidden = true; img.hidden = false; });
    });
  }
  function render(next) {
    state = next;
    const studying = state === 'active';
    link.setAttribute('aria-label', `Abrir O que estou estudando. Prévia: ${studying ? 'estudando' : state === 'idle' ? 'descansando' : 'status indisponível'}.`);
    targets.forEach(target => {
      target.querySelectorAll('video').forEach(video => video.pause());
      target.replaceChildren();
      if (state === 'unavailable') { target.textContent = 'Status indisponível'; return; }
      const name = studying ? 'writing' : 'sleeping';
      const img = document.createElement('img');
      img.src = studying ? 'assets/study/writing.jpg' : 'assets/study/sleeping.png'; img.alt = studying ? 'SanSan escrevendo à mesa' : 'SanSan dormindo e sonhando com Raissa';
      if (!studying) { target.append(img); return; }
      const video = document.createElement('video');
      video.src = `assets/study/${name}.mp4`; video.poster = img.src;
      video.muted = true; video.loop = true; video.playsInline = true; video.preload = 'none';
      video.setAttribute('aria-hidden','true'); video.tabIndex = -1;
      video.addEventListener('error', () => { video.hidden = true; img.hidden = false; });
      target.append(img,video);
    });
    updatePlayback();
  }
  toggle.addEventListener('click', () => { paused = !paused; updatePlayback(); });
  window.addEventListener('study-preview-state', event => render(event.detail));
  reduced.addEventListener('change', updatePlayback);
  document.addEventListener('visibilitychange', updatePlayback);
  window.addEventListener('pagehide', () => targets.forEach(t => t.querySelector('video')?.pause()));
  render('idle');
})();
