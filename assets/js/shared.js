/* =================================================================
   ENDURANCE AERO LABS · SHARED JS
   Used by every page. Handles:
     - Footer timestamp
     - Scroll-reveal animations
     - Mission HUD (only activates if #hud element exists on page)
   =================================================================
*/

(function () {
  // ----- Footer timestamp
  const ts = document.getElementById('ts');
  if (ts) {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    ts.textContent = `${d.getUTCFullYear()}.${pad(d.getUTCMonth() + 1)}.${pad(d.getUTCDate())} · ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
  }

  // ----- Scroll reveal
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    // Mission diamond activation (only on pages that have .mission cards)
    const missions = document.querySelectorAll('.mission');
    if (missions.length) {
      const missionIO = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) e.target.classList.add('in');
        });
      }, { threshold: 0.25 });
      missions.forEach(el => missionIO.observe(el));
    }
  } else {
    // No IO support: just reveal everything
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  }

  // ----- Mission HUD (optional; only runs if elements exist)
  const hud      = document.getElementById('hud');
  const hudT     = document.getElementById('hud-t');
  const hudAlt   = document.getElementById('hud-alt');
  const hudPhase = document.getElementById('hud-phase');
  const hudBar   = document.getElementById('hud-bar');

  if (hud && hudT && hudAlt && hudPhase && hudBar) {
    // T+ timer
    const start = Date.now();
    function tick() {
      const s = Math.floor((Date.now() - start) / 1000);
      const h = String(Math.floor(s / 3600)).padStart(2, '0');
      const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
      const sec = String(s % 60).padStart(2, '0');
      hudT.textContent = `${h}:${m}:${sec}`;
    }
    setInterval(tick, 1000);
    tick();

    setTimeout(() => hud.classList.add('in'), 600);

    const phaseSections = Array.from(document.querySelectorAll('[data-phase]'));
    function updateHud() {
      const max = document.body.scrollHeight - window.innerHeight;
      const pct = Math.min(100, Math.max(0, (window.scrollY / max) * 100));
      hudAlt.textContent = `${pct.toFixed(0).padStart(3, '0')}%`;
      hudBar.style.width = `${pct}%`;

      const mid = window.scrollY + window.innerHeight * 0.4;
      let current = phaseSections[0];
      for (const s of phaseSections) {
        if (s.offsetTop <= mid) current = s;
      }
      if (current) {
        const phase = current.getAttribute('data-phase');
        if (hudPhase.textContent !== phase) hudPhase.textContent = phase;
      }
    }
    updateHud();
    window.addEventListener('scroll', updateHud, { passive: true });
    window.addEventListener('resize', updateHud);
  }
})();
