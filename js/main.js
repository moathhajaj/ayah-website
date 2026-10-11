/* ═══════════════════════════════════════════════════════════
   AYAH, landing page interactions
   ═══════════════════════════════════════════════════════════ */

(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Icons ─────────────────────────────────────────────── */
  const initIcons = () => {
    if (window.lucide) window.lucide.createIcons();
  };
  initIcons();

  /* ── Sticky navigation ─────────────────────────────────── */
  const nav = document.getElementById("siteNav");
  const onScrollNav = () => nav.classList.toggle("scrolled", window.scrollY > 24);
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  /* ── Mobile menu ───────────────────────────────────────── */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    navToggle.querySelector("svg, i")?.remove();
    const icon = document.createElement("i");
    icon.setAttribute("data-lucide", open ? "x" : "menu");
    navToggle.appendChild(icon);
    initIcons();
  });

  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.querySelector("svg, i")?.remove();
      const icon = document.createElement("i");
      icon.setAttribute("data-lucide", "menu");
      navToggle.appendChild(icon);
      initIcons();
    })
  );

  /* ── Starfield ─────────────────────────────────────────── */
  const sky = document.getElementById("starfield");
  if (sky) {
    const COUNT = 70;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < COUNT; i++) {
      const s = document.createElement("span");
      s.className = "star";
      const size = Math.random() * 2.2 + 0.6;
      s.style.width = s.style.height = `${size}px`;
      s.style.left = `${Math.random() * 100}%`;
      s.style.top = `${Math.random() * 100}%`;
      s.style.animationDelay = `${Math.random() * 4}s`;
      s.style.animationDuration = `${3 + Math.random() * 4}s`;
      frag.appendChild(s);
    }
    sky.appendChild(frag);
  }

  /* ── Reveal on scroll ──────────────────────────────────── */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ── Count-up stats ────────────────────────────────────── */
  const nums = document.querySelectorAll(".stat-num[data-count]");
  const runCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = target.toLocaleString() + suffix; return; }
    const dur = 1600;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window) {
    const statIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { runCount(e.target); statIO.unobserve(e.target); }
        });
      },
      { threshold: 0.5 }
    );
    nums.forEach((n) => statIO.observe(n));
  } else {
    nums.forEach(runCount);
  }

  /* ── Verse gallery carousel ────────────────────────────── */
  const gallery = document.getElementById("gallery");
  const dotsWrap = document.getElementById("galDots");
  const prevBtn = document.getElementById("galPrev");
  const nextBtn = document.getElementById("galNext");

  if (gallery && dotsWrap && prevBtn && nextBtn) {
    const cards = Array.from(gallery.children);
    const isRTL = document.documentElement.dir === "rtl";
    let active = 0;
    let timer = null;

    // Build dots
    cards.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", `Go to verse ${i + 1}`);
      b.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(b);
    });
    const dots = Array.from(dotsWrap.children);

    function goTo(i) {
      active = (i + cards.length) % cards.length;
      cards[active].scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        inline: "center",
        block: "nearest",
      });
      sync();
    }

    function sync() {
      dots.forEach((d, i) => {
        d.classList.toggle("active", i === active);
        d.setAttribute("aria-selected", String(i === active));
      });
    }

    // Track scroll position → active dot (direction-agnostic)
    let raf = null;
    gallery.addEventListener("scroll", () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const gRect = gallery.getBoundingClientRect();
        const center = gRect.left + gRect.width / 2;
        let best = 0, bestDist = Infinity;
        cards.forEach((c, i) => {
          const r = c.getBoundingClientRect();
          const d = Math.abs(r.left + r.width / 2 - center);
          if (d < bestDist) { bestDist = d; best = i; }
        });
        if (best !== active) { active = best; sync(); }
      });
    }, { passive: true });

    prevBtn.addEventListener("click", () => { restartAuto(); goTo(active - 1); });
    nextBtn.addEventListener("click", () => { restartAuto(); goTo(active + 1); });

    // Auto-advance
    const startAuto = () => {
      if (reduceMotion || timer) return;
      timer = setInterval(() => goTo(active + 1), 5200);
    };
    const stopAuto = () => { clearInterval(timer); timer = null; };
    const restartAuto = () => { stopAuto(); startAuto(); };

    gallery.addEventListener("pointerenter", stopAuto);
    gallery.addEventListener("pointerleave", startAuto);
    gallery.addEventListener("focusin", stopAuto);
    gallery.addEventListener("focusout", startAuto);

    // Keyboard support when gallery focused (direction-aware)
    gallery.addEventListener("keydown", (e) => {
      const prevKey = isRTL ? "ArrowRight" : "ArrowLeft";
      const nextKey = isRTL ? "ArrowLeft" : "ArrowRight";
      if (e.key === prevKey) { e.preventDefault(); goTo(active - 1); }
      if (e.key === nextKey) { e.preventDefault(); goTo(active + 1); }
    });

    sync();
    startAuto();
  }

  /* ── FAQ accordion ─────────────────────────────────────── */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const q = item.querySelector(".faq-q");
    q.addEventListener("click", () => {
      const open = item.classList.toggle("open");
      q.setAttribute("aria-expanded", String(open));
    });
  });

  /* ── Parallax ornaments ────────────────────────────────── */
  const orns = document.querySelectorAll("[data-parallax]");
  if (orns.length && !reduceMotion) {
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        orns.forEach((o) => {
          const speed = parseFloat(o.dataset.parallax) || 0;
          o.style.transform = `translateY(${y * speed}px)`;
        });
        ticking = false;
      });
    }, { passive: true });
  }

  /* ── Footer year ───────────────────────────────────────── */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
