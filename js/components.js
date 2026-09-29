/* =========================================================================
   BIJST Components — Accordion Gallery · Card Swap · Depth Carousel
   ========================================================================= */

/* ─── 1. ACCORDION GALLERY (Our Research Scope) ─────────────────────────── */
class AccordionGallery {
  constructor(selector) {
    this.root = document.querySelector(selector);
    if (!this.root) return;
    this.panels = Array.from(this.root.querySelectorAll('.ag-panel'));
    this.active = 0;
    this.expandRatio = 0.52;
    this.duration = 0.55;
    this.count = this.panels.length;
    this._init();
  }

  _init() {
    // Clamp: only run on desktop
    if (window.innerWidth <= 900) return;
    this._apply(false);

    this.panels.forEach((panel, i) => {
      panel.addEventListener('mouseenter', () => this._setActive(i));
      panel.addEventListener('focus', () => this._setActive(i));
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth <= 900) {
        // Clear GSAP inline styles — CSS handles mobile
        gsap.set(this.panels, { clearProps: 'all' });
      } else {
        this._apply(false);
      }
    });
  }

  _setActive(i) {
    if (i === this.active) return;
    this.active = i;
    this._apply(true);
  }

  _apply(animate) {
    if (window.innerWidth <= 900) return;
    const n = this.count;
    const r = this.expandRatio;
    const grow = (r * (n - 1)) / (1 - r);
    const dur = animate ? this.duration : 0;

    this.panels.forEach((panel, i) => {
      const isActive = i === this.active;
      const tilt = isActive ? 0 : i < this.active ? 8 : -8;

      gsap.to(panel, {
        flexGrow: isActive ? grow : 1,
        rotateY: tilt,
        duration: dur,
        ease: 'power3.out',
      });

      // toggle active class for CSS label transitions
      panel.classList.toggle('active', isActive);
    });
  }
}

/* ─── 2. CARD SWAP (Editorial Board) ────────────────────────────────────── */
class CardSwap {
  constructor(selector) {
    this.root = document.querySelector(selector);
    if (!this.root) return;
    this.cards = Array.from(this.root.querySelectorAll('.card-swap-card'));
    if (!this.cards.length) return;

    this.cardW = 300;
    this.cardH = 390;
    this.distX = 55;
    this.distY = 65;
    this.skew = 6;
    this.delay = 4500;
    this.order = this.cards.map((_, i) => i);
    this._interval = null;

    if (window.innerWidth > 900) this._boot();

    window.addEventListener('resize', () => {
      if (window.innerWidth <= 900) {
        clearInterval(this._interval);
        gsap.set(this.cards, { clearProps: 'all' });
      } else if (!this._booted) {
        this._boot();
      }
    });
  }

  _slot(i) {
    return {
      x: i * this.distX,
      y: -i * this.distY,
      z: -i * this.distX * 1.5,
      zIndex: this.cards.length - i,
    };
  }

  _boot() {
    this._booted = true;
    const n = this.cards.length;

    this.cards.forEach((card, i) => {
      const s = this._slot(i);
      // Give card explicit size so GSAP translate works in absolute-positioned context
      gsap.set(card, {
        width: this.cardW,
        height: this.cardH,
        x: s.x,
        y: s.y,
        z: s.z,
        xPercent: -50,
        yPercent: -50,
        skewY: this.skew,
        transformOrigin: 'center center',
        zIndex: s.zIndex,
        force3D: true,
        position: 'absolute',
      });
    });

    this._swap();
    this._interval = setInterval(() => this._swap(), this.delay);

    this.root.addEventListener('mouseenter', () => clearInterval(this._interval));
    this.root.addEventListener('mouseleave', () => {
      this._interval = setInterval(() => this._swap(), this.delay);
    });
  }

  _swap() {
    if (this.order.length < 2) return;
    const [front, ...rest] = this.order;
    const elFront = this.cards[front];
    const tl = gsap.timeline();

    // 1. Fling front card down off screen
    tl.to(elFront, { y: '+=600', duration: 2, ease: 'elastic.out(0.6,0.9)' });

    // 2. Promote remaining cards
    tl.addLabel('promote', '-=1.75');
    rest.forEach((idx, i) => {
      const s = this._slot(i);
      tl.set(this.cards[idx], { zIndex: s.zIndex }, 'promote');
      tl.to(this.cards[idx], { x: s.x, y: s.y, z: s.z, duration: 2, ease: 'elastic.out(0.6,0.9)' }, `promote+=${i * 0.12}`);
    });

    // 3. Return front card to back slot
    const back = this._slot(this.cards.length - 1);
    tl.addLabel('return', 'promote+=0.35');
    tl.call(() => gsap.set(elFront, { zIndex: back.zIndex }), undefined, 'return');
    tl.to(elFront, { x: back.x, y: back.y, z: back.z, duration: 2, ease: 'elastic.out(0.6,0.9)' }, 'return');
    tl.call(() => { this.order = [...rest, front]; });
  }
}

/* ─── 3. DEPTH CAROUSEL (Submission Guidelines) ─────────────────────────── */
class DepthCarousel {
  constructor(selector) {
    this.root = document.querySelector(selector);
    if (!this.root) return;
    this.cards = Array.from(this.root.querySelectorAll('.depth-carousel__card'));
    if (!this.cards.length) return;

    // Config
    this.CARD_W = 340;
    this.CARD_H = 300;
    this.DEPTH = 180;
    this.SPREAD = 110;
    this.TILT = 20;
    this.FALLOFF = 0.25;
    this.VISIBLE = 3;

    this.pos = 0;
    this.focus = 0;
    this.n = this.cards.length;

    this._mobileInit();

    if (window.innerWidth > 900) {
      this._desktopInit();
    }

    window.addEventListener('resize', () => {
      if (window.innerWidth <= 900) {
        gsap.set(this.cards, { clearProps: 'all' });
      } else {
        this._layout(this.pos);
      }
    });
  }

  /* ── DESKTOP ── */
  _desktopInit() {
    this._layout(this.pos);

    this.root.querySelector('.depth-carousel__arrow--prev')
      ?.addEventListener('click', () => this._go(-1));
    this.root.querySelector('.depth-carousel__arrow--next')
      ?.addEventListener('click', () => this._go(1));

    this.cards.forEach((c, i) => c.addEventListener('click', () => this._goTo(i)));

    // Autoplay
    this._autoTimer = setInterval(() => {
      if (!this.root.matches(':hover')) this._go(1);
    }, 4000);
  }

  _go(step) { this._goTo(this.focus + step); }

  _goTo(raw) {
    const n = this.n;
    const idx = ((raw % n) + n) % n;
    let delta = idx - this.pos;
    delta = ((delta % n) + n) % n;
    if (delta > n / 2) delta -= n;

    const target = this.pos + delta;
    this.focus = idx;

    const proxy = { p: this.pos };
    gsap.to(proxy, {
      p: target,
      duration: 0.65,
      ease: 'power3.out',
      onUpdate: () => { this.pos = proxy.p; this._layout(this.pos); },
      onComplete: () => { this.pos = ((proxy.p % n) + n) % n; this._layout(this.pos); },
    });

    // Update mobile dots too
    this._updateDots(idx);
  }

  _layout(pos) {
    if (window.innerWidth <= 900) return;
    const n = this.n;

    this.cards.forEach((el, i) => {
      let d = i - pos;
      d = ((d % n) + n) % n;
      if (d > n / 2) d -= n;

      const back = Math.max(0, d);
      const shown = Math.abs(d) <= this.VISIBLE + 0.5;
      const tx = this.SPREAD * d;
      const tz = -this.DEPTH * d;
      const ry = this.TILT * Math.min(Math.max(d, 0), 1);
      const opacity = d < 0 ? Math.max(0, 1 + d) : shown ? 1 : 0;
      const brightness = Math.max(0.15, 1 - back * this.FALLOFF);
      const zi = Math.round(2000 - d * 20);

      el.style.width = this.CARD_W + 'px';
      el.style.height = this.CARD_H + 'px';
      el.style.transform = `translate(-50%, -50%) translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg)`;
      el.style.opacity = opacity;
      el.style.filter = `brightness(${brightness})`;
      el.style.zIndex = zi;
      el.style.pointerEvents = shown && opacity > 0.05 ? 'auto' : 'none';
    });
  }

  /* ── MOBILE — touch-swipe scrollable + dot pagination ── */
  _mobileInit() {
    // Build dot indicators
    const dotsWrap = this.root.querySelector('.dc-dots');
    if (dotsWrap) {
      this.cards.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'dc-dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        dot.addEventListener('click', () => {
          this._mobileSlideTo(i);
          this._updateDots(i);
          // sync desktop focus too
          this.focus = i;
        });
        dotsWrap.appendChild(dot);
      });
      this._dots = Array.from(dotsWrap.querySelectorAll('.dc-dot'));
    }

    // Wire mobile prev/next if present
    this.root.querySelector('.depth-carousel__arrow--prev')
      ?.addEventListener('click', () => {
        const newIdx = ((this.focus - 1) + this.n) % this.n;
        this._mobileSlideTo(newIdx);
        this._updateDots(newIdx);
        this.focus = newIdx;
      });
    this.root.querySelector('.depth-carousel__arrow--next')
      ?.addEventListener('click', () => {
        const newIdx = (this.focus + 1) % this.n;
        this._mobileSlideTo(newIdx);
        this._updateDots(newIdx);
        this.focus = newIdx;
      });
  }

  _mobileSlideTo(i) {
    const track = this.root.querySelector('.dc-mobile-track');
    if (!track) return;
    const card = track.children[i];
    if (!card) return;
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  _updateDots(i) {
    if (!this._dots) return;
    this._dots.forEach((d, idx) => d.classList.toggle('is-active', idx === i));
  }
}

/* ─── INIT ──────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  new AccordionGallery('#scope-carousel');
  new CardSwap('#card-swap-container');
  new DepthCarousel('#guidelines-carousel');
});
