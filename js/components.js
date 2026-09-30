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

    this.cardW = 420;
    this.cardH = 540;
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

/* ─── 3. DEPTH CAROUSEL (Mobile Snap Track only) ─────────────────────────── */
class DepthCarousel {
  constructor(selector) {
    this.root = document.querySelector(selector);
    if (!this.root) return;
    
    this.track = this.root.querySelector('.dc-mobile-track');
    if (!this.track) return;
    
    this.cards = Array.from(this.track.children);
    if (!this.cards.length) return;
    
    this.n = this.cards.length;
    this._mobileInit();
  }

  _mobileInit() {
    const dotsWrap = this.root.querySelector('.dc-dots');
    if (!dotsWrap) return;

    this._dots = [];
    for (let i = 0; i < this.n; i++) {
      const d = document.createElement('div');
      d.className = 'dc-dot' + (i === 0 ? ' is-active' : '');
      d.addEventListener('click', () => this._goToCard(i));
      this._dots.push(d);
      dotsWrap.appendChild(d);
    }

    let isScrolling;
    this.track.addEventListener('scroll', () => {
      window.clearTimeout(isScrolling);
      isScrolling = setTimeout(() => {
        const center = this.track.scrollLeft + this.track.clientWidth / 2;
        let closest = 0;
        let minDiff = Infinity;
        this.cards.forEach((c, i) => {
          const cCenter = c.offsetLeft + c.clientWidth / 2;
          const diff = Math.abs(cCenter - center);
          if (diff < minDiff) { minDiff = diff; closest = i; }
        });
        this._updateDots(closest);
      }, 50);
    }, { passive: true });
  }

  _goToCard(i) {
    const card = this.cards[i];
    if (!card) return;
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  _updateDots(i) {
    if (!this._dots) return;
    this._dots.forEach((d, idx) => d.classList.toggle('is-active', idx === i));
  }
}

/* ─── INIT ──────────────────────────────────────────────────────────────── */

/* ─── 4. GUIDELINES ACCORDION (Desktop hover-expand) ──────────────────── */
class GuidelinesAccordion {
  constructor(selector) {
    this.root = document.querySelector(selector);
    if (!this.root || window.innerWidth <= 900) return;
    this.cards = Array.from(this.root.querySelectorAll('.depth-carousel__stage .depth-carousel__card'));
    if (!this.cards.length) return;
    this._init();
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 900) {
        this.cards.forEach(c => { c.classList.remove('gc-active'); c.style.flexGrow = ''; });
      } else {
        this._apply(0);
      }
    });
  }

  _init() {
    this._apply(0);
    this.cards.forEach((card, i) => {
      card.addEventListener('mouseenter', () => this._apply(i));
    });
    this.root.addEventListener('mouseleave', () => this._apply(0));
  }

  _apply(activeIdx) {
    if (window.innerWidth <= 900) return;
    this.cards.forEach((card, i) => {
      card.classList.toggle('gc-active', i === activeIdx);
      gsap.to(card, { flexGrow: i === activeIdx ? 2.5 : 1, duration: 0.5, ease: 'power3.out' });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AccordionGallery('#scope-carousel');
  new CardSwap('#card-swap-container');
  new DepthCarousel('#guidelines-carousel');
  new GuidelinesAccordion('#guidelines-carousel');
});
