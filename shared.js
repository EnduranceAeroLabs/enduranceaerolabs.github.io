/* =================================================================
   ENDURANCE AERO LABS · SHARED JS
   Used by every page. Handles:
     - Footer timestamp
     - Scroll-reveal animations
     - Mission HUD (only activates if #hud element exists on page)
     - Mobile menu (injected — no HTML changes needed per page)
     - Touch-friendly dropdown toggle
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
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  }

  // ----- Mission HUD (optional; only runs if elements exist)
  const hud      = document.getElementById('hud');
  const hudT     = document.getElementById('hud-t');
  const hudAlt   = document.getElementById('hud-alt');
  const hudPhase = document.getElementById('hud-phase');
  const hudBar   = document.getElementById('hud-bar');

  if (hud && hudT && hudAlt && hudPhase && hudBar) {
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
      const pct = max > 0
        ? Math.min(100, Math.max(0, (window.scrollY / max) * 100))
        : 0;
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
    function updateHudBottomVisibility() {
  const mobileQuery = window.matchMedia('(max-width: 880px)');
  const doc = document.documentElement;

  const scrollBottom = window.scrollY + window.innerHeight;
  const pageBottom = doc.scrollHeight;

  const isMobile = mobileQuery.matches;
  const isAtBottom = Math.ceil(scrollBottom) >= pageBottom - 2;

  hud.classList.toggle('mobile-bottom-hidden', isMobile && isAtBottom);
}

function updateHudBottomVisibility() {
  const doc = document.documentElement;

  const scrollBottom = window.scrollY + window.innerHeight;
  const pageBottom = doc.scrollHeight;

  const isAtBottom = Math.ceil(scrollBottom) >= pageBottom - 2;

  hud.classList.toggle('mobile-bottom-hidden', isAtBottom);
}

function updateEverythingHud() {
  updateHud();
  updateHudBottomVisibility();
}

updateEverythingHud();

window.addEventListener('scroll', updateEverythingHud, { passive: true });
window.addEventListener('resize', updateEverythingHud);
  }

  // ============================================================
  // MOBILE MENU — injected automatically, no per-page HTML needed
  // ============================================================
  function buildMobileMenu() {
    const navInner = document.querySelector('.nav-inner');
    const navLinks = document.querySelector('.nav-links');
    if (!navInner || !navLinks) return;
    if (document.querySelector('.nav-burger') || document.querySelector('.mobile-drawer')) return;

    // --- 1. Inject hamburger button into nav
    const burger = document.createElement('button');
    burger.className = 'nav-burger';
    burger.setAttribute('aria-label', 'Open menu');
    burger.setAttribute('aria-expanded', 'false');
    burger.innerHTML = '<span class="bar"></span><span class="bar"></span><span class="bar"></span>';
    navInner.appendChild(burger);

    // --- 2. Build drawer from existing nav structure
    const drawer = document.createElement('div');
    drawer.className = 'mobile-drawer';
    drawer.setAttribute('aria-hidden', 'true');

    // Header
    const header = document.createElement('div');
    header.className = 'mobile-drawer-head';
    header.innerHTML = `
      <span class="mobile-drawer-eyebrow">Mission Navigation</span>
      <button class="mobile-drawer-close" aria-label="Close menu"></button>
    `;
    drawer.appendChild(header);

    // Body
    const body = document.createElement('div');
    body.className = 'mobile-drawer-body';

    // Collect top-level links and the dropdown separately
    const topLinks = [];
    let missionDropdown = null;

    Array.from(navLinks.children).forEach(child => {
      if (child.classList.contains('nav-dropdown')) {
        missionDropdown = child;
      } else if (child.tagName === 'A') {
        topLinks.push(child);
      }
    });

    // Build "Sections" group with top-level links
    const sectionsGroup = document.createElement('div');
    sectionsGroup.className = 'mobile-drawer-section';
    sectionsGroup.innerHTML = '<div class="mobile-drawer-section-label">Sections</div>';
    topLinks.forEach((a, i) => {
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.className = 'md-link';
      const num = String(i + 1).padStart(2, '0');
      link.innerHTML = `<span>${a.textContent.trim()}</span><span class="md-num">/ ${num}</span>`;
      sectionsGroup.appendChild(link);
    });
    body.appendChild(sectionsGroup);

    // Build "Missions" group from dropdown menu
    if (missionDropdown) {
      const menu = missionDropdown.querySelector('.nav-dropdown-menu');
      const missionLinks = menu ? menu.querySelectorAll('a:not(.dd-all)') : [];
      if (missionLinks.length) {
        const missionsGroup = document.createElement('div');
        missionsGroup.className = 'mobile-drawer-section';
        missionsGroup.innerHTML = '<div class="mobile-drawer-section-label">Missions</div>';
        missionLinks.forEach(srcLink => {
          const id = srcLink.querySelector('.dd-id');
          const name = srcLink.querySelector('.dd-name');
          if (!id || !name) return;
          const link = document.createElement('a');
          link.href = srcLink.getAttribute('href');
          link.className = 'md-mission';
          link.innerHTML = `
            <span class="md-mission-id">${id.textContent.trim()}</span>
            <span class="md-mission-name">${name.innerHTML}</span>
          `;
          missionsGroup.appendChild(link);
        });
        body.appendChild(missionsGroup);
      }
    }

    drawer.appendChild(body);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'mobile-drawer-foot';
    footer.innerHTML = `
      <span>Endurance Aero Labs</span>
      <span class="md-foot-status"><span class="status-dot"></span>Available · Summer 2026</span>
    `;
    drawer.appendChild(footer);

    document.body.appendChild(drawer);

    // --- 3. Toggle behavior
    const closeBtn = drawer.querySelector('.mobile-drawer-close');

    function openDrawer() {
      drawer.classList.add('open');
      burger.classList.add('open');
      document.body.classList.add('drawer-open');
      burger.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
    }
    function closeDrawer() {
      drawer.classList.remove('open');
      burger.classList.remove('open');
      document.body.classList.remove('drawer-open');
      burger.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
    }
    function toggleDrawer() {
      if (drawer.classList.contains('open')) closeDrawer();
      else openDrawer();
    }

    burger.addEventListener('click', toggleDrawer);
    closeBtn.addEventListener('click', closeDrawer);

    // Close when a drawer link is tapped (with a tiny delay so the
    // anchor jump still happens cleanly)
    drawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        setTimeout(closeDrawer, 120);
      });
    });

    // Escape key closes
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
    });

    // Close if viewport grows past mobile breakpoint while open
    const mq = window.matchMedia('(min-width: 981px)');
    mq.addEventListener('change', (e) => {
      if (e.matches && drawer.classList.contains('open')) closeDrawer();
    });
  }

  // ============================================================
  // TOUCH-FRIENDLY DESKTOP DROPDOWN
  // On no-hover devices (touch screens / iPad with the desktop nav
  // visible at >980px), toggle the dropdown on tap instead of hover.
  // ============================================================
  function setupTouchDropdown() {
    const dropdown = document.querySelector('.nav-dropdown');
    if (!dropdown) return;
    const trigger = dropdown.querySelector('.nav-dropdown-trigger');
    if (!trigger) return;

    // Only intervene on touch devices
    const isTouch = window.matchMedia('(hover: none)').matches;
    if (!isTouch) return;

    trigger.addEventListener('click', (e) => {
      // If the menu is closed, prevent the anchor jump and open
      if (!dropdown.classList.contains('open')) {
        e.preventDefault();
        dropdown.classList.add('open');
      } else {
        // If already open, let the link work normally
        dropdown.classList.remove('open');
      }
    });

    // Tap outside closes
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) dropdown.classList.remove('open');
    });
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      buildMobileMenu();
      setupTouchDropdown();
    });
  } else {
    buildMobileMenu();
    setupTouchDropdown();
  }
})();
