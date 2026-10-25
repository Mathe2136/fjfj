(() => {
  'use strict';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const pet = document.createElement('div');
  pet.className = 'study-pet';
  pet.setAttribute('aria-hidden', 'true');
  document.body.append(pet);
  const pageMedia = document.querySelector('#study-character');
  const details = document.querySelector('#study-details');
  const resting = document.querySelector('#study-resting');
  const topic = document.querySelector('#study-topic');
  const subject = document.querySelector('#study-subject');
  const start = document.querySelector('#study-start');
  const time = document.querySelector('#study-time');
  const caption = document.querySelector('#study-caption');
  const announcement = document.querySelector('#study-announcement');
  let current = { active: false }, lastKey = '', busy = false;

  function valid(value) {
    if (!value || typeof value.active !== 'boolean') throw Error('Invalid status');
    if (!value.active) return { active: false };
    if (typeof value.topic !== 'string' || !value.topic.trim() || value.topic.length > 80 || typeof value.subject !== 'string' || value.subject.length > 160) throw Error('Invalid public summary');
    const expires = Date.parse(value.expiresAt);
    if (!Number.isFinite(expires) || expires <= Date.now()) return { active: false };
    return { active: true, topic: value.topic, subject: value.subject, startedAt: value.startedAt, expiresAt: value.expiresAt };
  }

  function image(src, alt = '') {
    const element = document.createElement('img');
    element.src = src;
    element.alt = alt;
    element.draggable = false;
    return element;
  }

  function studyMedia(alt = '') {
    if (reducedMotion.matches) return image('assets/study/writing.png', alt);
    const video = document.createElement('video');
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.poster = 'assets/study/writing.png';
    video.setAttribute('aria-label', alt);
    const source = document.createElement('source');
    source.src = 'assets/study/writing-arm.webm?v=study-6';
    source.type = 'video/webm';
    video.append(source);
    video.addEventListener('error', () => video.replaceWith(image('assets/study/writing.png', alt)), { once: true });
    return video;
  }

  function replaceMedia(target, active, alt = '') {
    if (!target) return;
    target.querySelectorAll('video').forEach(video => video.pause());
    target.replaceChildren(active ? studyMedia(alt) : image('assets/study/sleeping.png', alt));
    const video = target.querySelector('video');
    if (video) video.play().catch(() => video.replaceWith(image('assets/study/writing.png', alt)));
  }

  function render(value) {
    const active = value?.active === true;
    pet.hidden = value === null;
    replaceMedia(pet, active);
    if (!pageMedia) return;
    pageMedia.hidden = value === null;
    replaceMedia(pageMedia, active, active ? 'SanSan escrevendo e estudando à mesa' : 'SanSan descansando e sonhando com Raissa');
    topic.textContent = active ? value.topic : '';
    subject.textContent = active ? value.subject : '';
    start.textContent = '';
    start.removeAttribute('datetime');
    time.hidden = true;
    const date = active && value.startedAt ? new Date(value.startedAt) : null;
    if (date && Number.isFinite(date.getTime())) {
      start.dateTime = date.toISOString();
      start.textContent = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }).format(date);
      time.hidden = false;
    }
    details.hidden = !active;
    resting.hidden = active;
    caption.textContent = active ? 'Aprendendo hoje, construindo o nosso amanhã.' : 'Até nos intervalos, penso em você.';
    const key = JSON.stringify(value);
    if (key !== lastKey) announcement.textContent = value === null ? 'Não foi possível atualizar o status agora.' : active ? `Estou estudando: ${value.topic}. ${value.subject}` : 'SanSan está descansando.';
    lastKey = key;
  }

  async function refresh() {
    if (busy || document.hidden) return;
    busy = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch('study-status.json?t=' + Date.now(), { cache: 'no-store', signal: controller.signal });
      if (!response.ok) throw Error('Status unavailable');
      current = valid(await response.json());
      render(current);
    } catch {
      current = null;
      render(null);
    } finally {
      clearTimeout(timeout);
      busy = false;
    }
  }

  render(current);
  refresh();
  setInterval(() => {
    if (current?.active && Date.parse(current.expiresAt) <= Date.now()) {
      current = { active: false };
      render(current);
    }
    refresh();
  }, 30000);
  document.addEventListener('visibilitychange', () => {
    pet.querySelectorAll('video').forEach(video => document.hidden ? video.pause() : video.play().catch(() => {}));
    pageMedia?.querySelectorAll('video').forEach(video => document.hidden ? video.pause() : video.play().catch(() => {}));
    if (!document.hidden) refresh();
  });
  reducedMotion.addEventListener('change', () => render(current));
  window.addEventListener('focus', refresh);
})();
