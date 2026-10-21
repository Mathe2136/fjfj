(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const shell = document.querySelector('#shell-scene');
  const toggle = document.querySelector('#shell-toggle');
  const couple = document.querySelector('#couple');
  const shellStatus = document.querySelector('#shell-status');
  const lid = shell.querySelector('.shell-lid');
  let shellOpen = false;
  let manuallyControlled = false;
  let shellTimeline;

  function describeShell(open, announce = false) {
    shellOpen = open;
    toggle.setAttribute('aria-expanded', String(open));
    couple.setAttribute('aria-hidden', String(!open));
    toggle.innerHTML = open ? 'Guardar nosso tesouro <span aria-hidden="true">−</span>' : 'Abrir nossa concha <span aria-hidden="true">+</span>';
    if (announce) shellStatus.textContent = open ? 'Concha aberta. SanSan e Raissa estão juntinhos.' : 'Concha fechada. Nosso tesouro está guardado.';
  }

  function setShell(open, announce = false) {
    describeShell(open, announce);
    if (shellTimeline && !reducedMotion.matches) {
      shellTimeline.tweenTo(open ? shellTimeline.duration() : 0, { duration: 1.15, ease: 'power2.inOut', overwrite: true });
    } else {
      shell.classList.toggle('is-open', open);
    }
  }
  toggle.addEventListener('click', () => {
    manuallyControlled = true;
    setShell(!shellOpen, true);
  });

  let heartCount = 0;
  let announcementTimer;
  document.querySelector('#send-heart').addEventListener('click', event => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    heart.setAttribute('aria-hidden', 'true');
    heart.innerHTML = '<svg viewBox="0 0 64 64"><use href="#heart"/></svg>';
    heart.style.left = `${bounds.left + bounds.width / 2}px`;
    heart.style.top = `${bounds.top + bounds.height / 2}px`;
    heart.style.setProperty('--drift', `${Math.random() * 130 - 65}px`);
    heart.style.setProperty('--rise', `${-(bounds.top + bounds.height / 2 + 70)}px`);
    heart.style.setProperty('--turn', `${Math.random() * 40 - 20}deg`);
    document.body.append(heart);
    heart.addEventListener('animationend', () => heart.remove(), { once: true });
    window.setTimeout(() => heart.remove(), reducedMotion.matches ? 1600 : 2900);
    heartCount++;
    clearTimeout(announcementTimer);
    announcementTimer = setTimeout(() => {
      document.querySelector('#heart-status').textContent = `${heartCount} ${heartCount === 1 ? 'coração enviado' : 'corações enviados'} para Raissa.`;
    }, 300);
  });

  const messages = [
    ['Você deixa os dias mais bonitos,', 'e a vida mais cheia de amor.'],
    ['De todas as coisas bonitas da vida,', 'você é a minha favorita.'],
    ['Em cada novo amanhã,', 'eu escolheria você de novo.']
  ];
  let messageIndex = 0;
  let messageAnimation;
  const message = document.querySelector('#message-text');
  function changeMessage(direction) {
    messageIndex = (messageIndex + direction + messages.length) % messages.length;
    if (messageAnimation) messageAnimation.cancel();
    message.replaceChildren(document.createTextNode(messages[messageIndex][0]), document.createElement('br'), document.createTextNode(messages[messageIndex][1]));
    const indicator = document.querySelector('#message-index');
    indicator.innerHTML = `0${messageIndex + 1} <span>/ 03</span>`;
    indicator.setAttribute('aria-label', `Mensagem ${messageIndex + 1} de 3`);
    if (!reducedMotion.matches && message.animate) {
      messageAnimation = message.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 450, easing: 'ease-out' });
    }
  }
  document.querySelector('#previous-message').addEventListener('click', () => changeMessage(-1));
  document.querySelector('#next-message').addEventListener('click', () => changeMessage(1));

  // Keep the scroll position native, including on touch screens.
  let progressPending = false;
  function updateProgress() {
    const range = document.documentElement.scrollHeight - window.innerHeight;
    document.querySelector('.reading-progress').style.transform = `scaleX(${range > 0 ? Math.max(0, Math.min(1, window.scrollY / range)) : 0})`;
    progressPending = false;
  }
  window.addEventListener('scroll', () => {
    if (!progressPending) { progressPending = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const sentence = document.querySelector('.love-sentence');
  // Split only text nodes so the portrait images and emphasis remain semantic.
  function splitWords(node) {
    [...node.childNodes].forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        const fragment = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(part => {
          if (!part.trim()) fragment.append(document.createTextNode(part));
          else { const word = document.createElement('span'); word.className = 'word'; word.textContent = part; fragment.append(word); }
        });
        child.replaceWith(fragment);
      } else if (child.nodeType === Node.ELEMENT_NODE && !child.classList.contains('inline-portraits')) splitWords(child);
    });
  }
  splitWords(sentence);
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.from('.title-line', { y: 40, opacity: 0, duration: 1.25, stagger: .14, ease: 'power3.out' });
    gsap.from('.hero-enter', { y: 18, opacity: 0, duration: 1, stagger: .12, delay: .3, ease: 'power2.out' });
    gsap.to('.hero-content', { y: -65, opacity: .15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 15%', scrub: .6 } });
    gsap.to('.pearl-one', { y: -90, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
    gsap.fromTo('.love-sentence .word', { opacity: .24 }, { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: '.love-sentence', start: 'top 82%', end: 'bottom 42%', scrub: .5 } });
    gsap.utils.toArray('.reveal').forEach(element => {
      gsap.from(element, { y: 32, opacity: 0, duration: .9, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 90%', toggleActions: 'play none none reverse' } });
    });
    gsap.fromTo(shell, { scale: .86 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: shell, start: 'top 95%', end: 'center 55%', scrub: .6 } });
    gsap.to(shell, { opacity: .3, ease: 'none', scrollTrigger: { trigger: shell, start: 'bottom 22%', end: 'bottom top', scrub: .5 } });
    shell.classList.remove('is-open');
    shell.classList.add('gsap-shell');
    shellTimeline = gsap.timeline({ paused: true }).to(lid, { rotateX: 110, duration: 1.2, ease: 'power2.inOut' }, 0).to(couple, { opacity: 1, y: 0, scale: 1, duration: .8, ease: 'power2.out' }, .35);
    if (shellOpen) shellTimeline.progress(1);
    const opening = ScrollTrigger.create({ trigger: shell, start: 'top 55%', end: 'center 35%', onUpdate: self => {
      if (manuallyControlled || !shellTimeline) return;
      shellTimeline.progress(self.progress);
      describeShell(self.progress > .65);
    } });
    gsap.to('.shell-spark', { y: -12, stagger: .3, repeat: -1, yoyo: true, duration: 2.5, ease: 'sine.inOut' });
    return () => {
      opening.kill();
      shellTimeline?.kill();
      shellTimeline = null;
      shell.classList.remove('gsap-shell');
      shell.classList.toggle('is-open', shellOpen);
    };
  });
  // Recalculate after fonts and images settle to avoid misplaced scroll transitions.
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
})();
