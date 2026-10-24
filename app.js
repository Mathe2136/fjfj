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

  const messageStage = document.querySelector('#message-stage');
  const messageCards = [...messageStage.querySelectorAll('.message-card')];
  const messageDots = [...document.querySelectorAll('.message-dots i')];
  const messageIndicator = document.querySelector('#message-index');
  let messageIndex = 0;
  let messageFrame = 0;
  let mouseDrag = null;

  function updateMessagePosition() {
    messageFrame = 0;
    const width = messageStage.clientWidth;
    if (!width) return;
    const next = Math.max(0, Math.min(messageCards.length - 1, Math.round(messageStage.scrollLeft / width)));
    if (next === messageIndex) return;
    messageIndex = next;
    messageIndicator.innerHTML = `0${next + 1} <span>/ 03</span>`;
    messageIndicator.setAttribute('aria-label', `Mensagem ${next + 1} de 3`);
    messageDots.forEach((dot, i) => dot.classList.toggle('is-current', i === next));
  }
  function goToMessage(index, instant = false) {
    const target = Math.max(0, Math.min(messageCards.length - 1, index));
    messageStage.scrollTo({ left: target * messageStage.clientWidth, behavior: instant || reducedMotion.matches ? 'instant' : 'smooth' });
  }
  messageStage.addEventListener('scroll', () => {
    if (!messageFrame) messageFrame = requestAnimationFrame(updateMessagePosition);
  }, { passive: true });
  messageStage.addEventListener('keydown', event => {
    const directions = { ArrowLeft: messageIndex - 1, ArrowRight: messageIndex + 1, Home: 0, End: messageCards.length - 1 };
    if (!(event.key in directions)) return;
    event.preventDefault();
    goToMessage(directions[event.key]);
  });
  // Touch uses the browser's native swipe. Mouse dragging adds the same gesture on desktop.
  messageStage.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    mouseDrag = { x: event.clientX, left: messageStage.scrollLeft, index: messageIndex, id: event.pointerId };
    messageStage.classList.add('is-dragging');
    messageStage.setPointerCapture(event.pointerId);
  });
  messageStage.addEventListener('pointermove', event => {
    if (!mouseDrag || event.pointerId !== mouseDrag.id) return;
    messageStage.scrollLeft = mouseDrag.left + mouseDrag.x - event.clientX;
  });
  function finishMessageDrag(event) {
    if (!mouseDrag || event.pointerId !== mouseDrag.id) return;
    const drag = mouseDrag;
    mouseDrag = null;
    messageStage.classList.remove('is-dragging');
    if (messageStage.hasPointerCapture(event.pointerId)) messageStage.releasePointerCapture(event.pointerId);
    const distance = drag.x - event.clientX;
    const direction = event.type === 'pointercancel' || Math.abs(distance) < 35 ? 0 : Math.sign(distance);
    goToMessage(drag.index + direction);
  }
  messageStage.addEventListener('pointerup', finishMessageDrag);
  messageStage.addEventListener('pointercancel', finishMessageDrag);
  messageStage.addEventListener('lostpointercapture', event => {
    if (!mouseDrag) return;
    finishMessageDrag({ pointerId: event.pointerId, clientX: mouseDrag.x, type: 'pointercancel' });
  });
  window.addEventListener('resize', () => goToMessage(messageIndex, true));

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
    shellTimeline = gsap.timeline({ paused: true }).fromTo(lid, { rotateX: 68 }, { rotateX: 0, duration: 1.2, ease: 'power2.inOut' }, 0).to(couple, { opacity: 1, y: 0, scale: 1, duration: .7, ease: 'power2.out' }, .45);
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

