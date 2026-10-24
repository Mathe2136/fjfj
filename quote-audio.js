(() => {
  'use strict';
  const audio = document.querySelector('#quote-audio');
  const button = document.querySelector('#quote-play');
  const label = document.querySelector('#quote-play-label');
  const status = document.querySelector('#quote-audio-status');
  if (!audio || !button) return;
  let pending = false;
  function paint(playing) {
    button.setAttribute('data-playing', String(playing));
    button.setAttribute('aria-label', playing ? 'Pausar a frase para a MiMi' : 'Ouvir a frase para a MiMi');
    label.textContent = playing ? 'Uma frase para nós dois' : 'Ouça essa frase, MiMi';
  }
  button.addEventListener('click', async () => {
    if (pending) return;
    if (!audio.paused) { audio.pause(); return; }
    pending = true;
    button.setAttribute('aria-busy', 'true');
    label.textContent = 'Preparando o áudio…';
    try {
      if (audio.error) audio.load();
      if (audio.ended) audio.currentTime = 0;
      await audio.play();
    } catch {
      paint(false);
      label.textContent = 'Toque para tentar novamente';
      status.textContent = 'Não foi possível reproduzir o áudio. Toque no botão para tentar novamente.';
    } finally {
      pending = false;
      button.setAttribute('aria-busy', 'false');
    }
  });
  audio.addEventListener('playing', () => { paint(true); status.textContent = 'Reproduzindo a frase para a MiMi.'; });
  audio.addEventListener('pause', () => { paint(false); status.textContent = 'Áudio pausado.'; });
  audio.addEventListener('ended', () => { paint(false); status.textContent = 'Fim do áudio. Toque para ouvir novamente.'; });
  audio.addEventListener('error', () => { paint(false); label.textContent = 'Toque para tentar novamente'; status.textContent = 'O áudio não carregou. Tente novamente.'; });
  window.addEventListener('pagehide', () => audio.pause());
})();
