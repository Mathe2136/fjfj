(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const fields = ['#study-topic', '#study-subject', '#study-start'];
  function render(state) {
    fields.forEach(s => { $(s).textContent = ''; });
    $('#study-start').removeAttribute('datetime');
    $('#study-details').hidden = true;
    if (state === 'active') {
      $('#status-title').textContent = 'Estou estudando';
      $('#status-message').textContent = 'Um pouquinho do que estou aprendendo hoje, meu amor.';
      $('#study-topic').textContent = 'Agentes de IA';
      $('#study-subject').textContent = 'Claude Desktop, Cowork e Task Loop';
      $('#study-start').textContent = '14:30 (horário de Brasília, exemplo)';
      $('#study-details').hidden = false;
    } else if (state === 'unavailable') {
      $('#status-title').textContent = 'Meu recadinho já volta.';
      $('#status-message').textContent = 'Não consegui atualizar meu status agora. Te deixo um carinho enquanto isso.';
    } else {
      $('#status-title').textContent = 'Uma pausa, meu amor.';
      $('#status-message').textContent = 'Agora estou descansando. Você continua aqui nos meus pensamentos, MiMi.';
    }
    document.querySelectorAll('[data-state]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.state === state)));
    $('#study-announcement').textContent = $('#status-title').textContent;
    window.dispatchEvent(new CustomEvent('study-preview-state', {detail:state}));
  }
  document.querySelectorAll('[data-state]').forEach(b => b.addEventListener('click', () => render(b.dataset.state)));
  render('idle');
})();