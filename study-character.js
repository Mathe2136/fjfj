(() => {
  'use strict';
  const pet = document.createElement('div');
  pet.className = 'study-pet'; pet.setAttribute('aria-hidden','true');
  const picture = document.createElement('img'); picture.alt = ''; picture.draggable = false;
  pet.append(picture); document.body.append(pet);
  const pageImage = document.querySelector('#study-character');
  const details = document.querySelector('#study-details');
  const topic = document.querySelector('#study-topic');
  const subject = document.querySelector('#study-subject');
  const start = document.querySelector('#study-start');
  const time = document.querySelector('#study-time');
  const announcement = document.querySelector('#study-announcement');
  let current = {active:false}, lastKey = '', busy = false;
  function valid(value) {
    if (!value || typeof value.active !== 'boolean') throw Error('Invalid status');
    if (!value.active) return {active:false};
    if (typeof value.topic !== 'string' || !value.topic.trim() || value.topic.length > 80 || typeof value.subject !== 'string' || value.subject.length > 160) throw Error('Invalid public summary');
    const expires = Date.parse(value.expiresAt);
    if (!Number.isFinite(expires) || expires <= Date.now()) return {active:false};
    return {active:true,topic:value.topic,subject:value.subject,startedAt:value.startedAt,expiresAt:value.expiresAt};
  }
  function render(value) {
    const active = value?.active === true;
    const src = active ? 'assets/study/writing.png' : 'assets/study/sleeping.png';
    pet.hidden = value === null;
    if (picture.getAttribute('src') !== src) picture.src = src;
    if (pageImage) {
      pageImage.hidden = value === null;
      if (pageImage.getAttribute('src') !== src) pageImage.src = src;
      pageImage.alt = active ? 'SanSan estudando à mesa' : 'SanSan descansando e sonhando com Raissa';
      topic.textContent = active ? value.topic : '';
      subject.textContent = active ? value.subject : '';
      start.textContent = ''; start.removeAttribute('datetime'); time.hidden = true;
      const date = active && value.startedAt ? new Date(value.startedAt) : null;
      if (date && Number.isFinite(date.getTime())) { start.dateTime = date.toISOString(); start.textContent = new Intl.DateTimeFormat('pt-BR',{hour:'2-digit',minute:'2-digit',timeZone:'America/Sao_Paulo'}).format(date) + ' (Brasília)'; time.hidden = false; }
      details.hidden = !active;
      const key = JSON.stringify(value);
      if (key !== lastKey) announcement.textContent = value === null ? 'Não foi possível atualizar o status agora.' : active ? `Estou estudando: ${value.topic}. ${value.subject}` : 'SanSan está descansando.';
      lastKey = key;
    }
  }
  async function refresh() {
    if (busy || document.hidden) return;
    busy = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch('study-status.json?t='+Date.now(), {cache:'no-store',signal:controller.signal});
      if (!response.ok) throw Error('Status unavailable');
      current = valid(await response.json()); render(current);
    } catch { current = null; render(null); }
    finally { clearTimeout(timeout); busy = false; }
  }
  render(current); refresh();
  setInterval(() => { if(current?.active && Date.parse(current.expiresAt)<=Date.now()){current={active:false};render(current);} refresh(); },30000);
  document.addEventListener('visibilitychange', () => {if(!document.hidden) refresh();});
  window.addEventListener('focus',refresh);
})();
