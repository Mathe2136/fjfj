(() => {
  'use strict';
  const section = document.querySelector('#nossa-historia');
  if (!section) return;
  const journey = section.querySelector('.timeline-journey');
  const svg = section.querySelector('.timeline-rail');
  const track = svg.querySelector('.rail-track');
  const drawn = svg.querySelector('.rail-drawn');
  const pearl = svg.querySelector('.rail-pearl');
  const glow = svg.querySelector('.rail-glow');
  const list = section.querySelector('.love-timeline');
  const entries = [...section.querySelectorAll('.timeline-entry')];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let anchors = [];
  let length = 0;
  let pending = false;

  function render() {
    pending = false;
    if (!anchors.length || !length) return;
    const bounds = journey.getBoundingClientRect();
    const targetY = Math.max(anchors[0], Math.min(anchors.at(-1), window.innerHeight * .62 - bounds.top));
    let distance = length;
    if (!motion.matches) {
      // Locate the pearl by vertical position even when the path curves sideways.
      let low = 0, high = length;
      for (let i = 0; i < 10; i++) {
        const mid = (low + high) / 2;
        if (drawn.getPointAtLength(mid).y < targetY) low = mid;
        else high = mid;
      }
      distance = targetY <= anchors[0] ? 0 : targetY >= anchors.at(-1) ? length : (low + high) / 2;
    }
    drawn.style.strokeDashoffset = String(length - distance);
    const tip = drawn.getPointAtLength(distance);
    [pearl, glow].forEach(node => { node.setAttribute('cx', tip.x); node.setAttribute('cy', tip.y); });
    let current = 0;
    anchors.forEach((y, i) => { if (targetY >= y - 1) current = i; });
    entries.forEach((entry, i) => {
      entry.classList.toggle('is-reached', motion.matches || targetY >= anchors[i] - 1);
      entry.classList.toggle('is-current', i === current);
      if (motion.matches || bounds.top + anchors[i] < window.innerHeight * .92) entry.classList.add('is-visible');
    });
  }
  function queue() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(render);
  }
  function measure() {
    anchors = entries.map(entry => {
      const dot = entry.querySelector('.timeline-dot');
      return list.offsetTop + entry.offsetTop + dot.offsetTop + dot.offsetHeight / 2;
    });
    svg.setAttribute('viewBox', `0 0 48 ${Math.max(1, journey.offsetHeight)}`);
    let path = `M24 ${anchors[0]}`;
    for (let i = 1; i < anchors.length; i++) {
      const a = anchors[i - 1], b = anchors[i], bend = i % 2 ? 42 : 6;
      path += ` C${bend} ${a + (b - a) * .36},${bend} ${a + (b - a) * .64},24 ${b}`;
    }
    track.setAttribute('d', path);
    drawn.setAttribute('d', path);
    length = drawn.getTotalLength();
    drawn.style.strokeDasharray = String(length);
    section.classList.add('timeline-ready');
    render();
  }
  measure();
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure, { once: true });
  if (document.fonts) document.fonts.ready.then(measure);
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(journey);
  motion.addEventListener('change', measure);

})();
