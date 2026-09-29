// Accordion Gallery Logic
class AccordionGallery {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) return;
    
    this.panels = Array.from(this.container.querySelectorAll('.ag-panel'));
    this.active = options.defaultIndex || Math.floor(this.panels.length / 2);
    this.expandRatio = options.expandRatio || 0.52;
    this.tilt = options.tilt || 8;
    this.duration = options.duration || 0.6;
    
    this.init();
  }

  init() {
    this.panels.forEach((panel, i) => {
      panel.addEventListener('mouseenter', () => this.setActive(i));
      panel.addEventListener('focus', () => this.setActive(i));
      panel.addEventListener('keydown', (e) => this.handleKeyDown(i, e));
    });
    this.applyLayout();
    
    // Add window resize listener
    window.addEventListener('resize', () => {
        if(window.innerWidth > 768) {
            this.applyLayout();
        } else {
            // Remove GSAP styles on mobile so CSS takes over
            gsap.set(this.panels, { clearProps: "all" });
        }
    });
  }

  setActive(index) {
    if (this.active === index) return;
    this.active = index;
    if (window.innerWidth > 768) {
      this.applyLayout();
    }
  }

  handleKeyDown(index, e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      this.setActive((index + 1) % this.panels.length);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      this.setActive((index - 1 + this.panels.length) % this.panels.length);
    }
  }

  applyLayout() {
    if (window.innerWidth <= 768) return;
    const count = this.panels.length;
    const grow = count > 1 ? (this.expandRatio * (count - 1)) / (1 - this.expandRatio) : 1;
    
    gsap.killTweensOf(this.panels);
    
    this.panels.forEach((panel, i) => {
      const isActive = i === this.active;
      const rot = isActive ? 0 : i < this.active ? this.tilt : -this.tilt;
      
      gsap.to(panel, {
        flexGrow: isActive ? grow : 1,
        rotateY: rot,
        duration: this.duration,
        ease: 'power3.out'
      });
      
      if(isActive) {
          panel.classList.add('active');
      } else {
          panel.classList.remove('active');
      }
    });
  }
}

// Card Swap Logic
class CardSwap {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) return;
    
    this.cards = Array.from(this.container.querySelectorAll('.card-swap-card'));
    if(this.cards.length === 0) return;
    
    this.cardDistance = options.cardDistance || 60;
    this.verticalDistance = options.verticalDistance || 70;
    this.delay = options.delay || 5000;
    this.skewAmount = options.skewAmount || 6;
    
    this.order = this.cards.map((_, i) => i);
    this.interval = null;
    
    this.init();
  }

  makeSlot(i) {
    return {
      x: i * this.cardDistance,
      y: -i * this.verticalDistance,
      z: -i * this.cardDistance * 1.5,
      zIndex: this.cards.length - i
    };
  }

  init() {
    if (window.innerWidth <= 768) return; // Desktop only
    
    this.cards.forEach((card, i) => {
      const slot = this.makeSlot(i);
      gsap.set(card, {
        x: slot.x,
        y: slot.y,
        z: slot.z,
        xPercent: -50,
        yPercent: -50,
        skewY: this.skewAmount,
        transformOrigin: 'center center',
        zIndex: slot.zIndex,
        force3D: true
      });
    });

    this.startInterval();

    this.container.addEventListener('mouseenter', () => this.stopInterval());
    this.container.addEventListener('mouseleave', () => this.startInterval());
    
    window.addEventListener('resize', () => {
        if(window.innerWidth <= 768) {
            this.stopInterval();
            gsap.set(this.cards, { clearProps: "all" });
        } else {
            this.init();
        }
    });
  }

  startInterval() {
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => this.swap(), this.delay);
  }

  stopInterval() {
    if (this.interval) clearInterval(this.interval);
  }

  swap() {
    if (this.order.length < 2) return;
    const frontIdx = this.order[0];
    const rest = this.order.slice(1);
    const elFront = this.cards[frontIdx];
    
    const tl = gsap.timeline();
    
    tl.to(elFront, {
      y: '+=500',
      duration: 2,
      ease: 'elastic.out(0.6,0.9)'
    });
    
    tl.addLabel('promote', `-=1.8`);
    
    rest.forEach((idx, i) => {
      const el = this.cards[idx];
      const slot = this.makeSlot(i);
      tl.set(el, { zIndex: slot.zIndex }, 'promote');
      tl.to(el, {
        x: slot.x,
        y: slot.y,
        z: slot.z,
        duration: 2,
        ease: 'elastic.out(0.6,0.9)'
      }, `promote+=${i * 0.15}`);
    });
    
    const backSlot = this.makeSlot(this.cards.length - 1);
    tl.addLabel('return', `promote+=0.4`);
    tl.call(() => gsap.set(elFront, { zIndex: backSlot.zIndex }), undefined, 'return');
    
    tl.to(elFront, {
      x: backSlot.x,
      y: backSlot.y,
      z: backSlot.z,
      duration: 2,
      ease: 'elastic.out(0.6,0.9)'
    }, 'return');
    
    tl.call(() => {
      this.order = [...rest, frontIdx];
    });
  }
}

// Depth Carousel Logic
class DepthCarousel {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) return;
    
    this.stage = this.container.querySelector('.depth-carousel__stage');
    this.cards = Array.from(this.container.querySelectorAll('.depth-carousel__card'));
    if(this.cards.length === 0) return;

    this.depth = options.depth || 220;
    this.spread = options.spread || 90;
    this.tilt = options.tilt || 22;
    this.tiltDirection = options.tiltDirection || 'right';
    this.visibleCards = options.visibleCards || 4;
    this.falloff = options.falloff || 0.2;
    
    this.pos = 0;
    this.focus = 0;
    
    this.init();
  }

  init() {
    if (window.innerWidth <= 768) return;
    
    this.layout(this.pos);
    
    const prevBtn = this.container.querySelector('.depth-carousel__arrow--prev');
    const nextBtn = this.container.querySelector('.depth-carousel__arrow--next');
    
    if(prevBtn) prevBtn.addEventListener('click', () => this.navigateBy(-1));
    if(nextBtn) nextBtn.addEventListener('click', () => this.navigateBy(1));
    
    this.cards.forEach((card, i) => {
        card.addEventListener('click', () => this.setFocus(i));
    });

    setInterval(() => {
        if(!this.container.matches(':hover')) {
            this.navigateBy(1);
        }
    }, 4000);
    
    window.addEventListener('resize', () => {
        if(window.innerWidth <= 768) {
            gsap.set(this.cards, { clearProps: "all" });
        } else {
            this.layout(this.pos);
        }
    });
  }

  navigateBy(step) {
    this.setFocus(this.focus + step);
  }

  setFocus(targetIndex) {
    const n = this.cards.length;
    let delta = targetIndex - this.pos;
    delta = ((delta % n) + n) % n;
    if (delta > n / 2) delta -= n;
    
    const newPos = this.pos + delta;
    this.focus = ((targetIndex % n) + n) % n;
    
    gsap.to(this, {
        pos: newPos,
        duration: 0.7,
        ease: 'power3.out',
        onUpdate: () => this.layout(this.pos),
        onComplete: () => {
            this.pos = ((this.pos % n) + n) % n;
            this.layout(this.pos);
        }
    });
  }

  layout(pos) {
    if (window.innerWidth <= 768) return;
    const n = this.cards.length;
    const dir = this.tiltDirection === 'left' ? -1 : 1;
    
    this.cards.forEach((el, i) => {
      let d = i - pos;
      d = ((d % n) + n) % n;
      if (d > n / 2) d -= n;
      
      const back = Math.max(0, d);
      const az = Math.abs(d);
      const shown = az <= this.visibleCards + 0.5;
      
      const tz = -this.depth * d;
      const tx = dir * this.spread * d;
      const ry = dir * this.tilt * Math.max(Math.min(d, 1), 0);
      
      let opacity = d < 0 ? Math.max(0, 1 + d) : 1;
      if (!shown) opacity = 0;
      
      const brightness = Math.max(0.15, 1 - back * this.falloff);
      const zi = Math.round(2000 - d * 20);
      
      el.style.transform = \`translate(-50%, -50%) translateX(\${tx}px) translateZ(\${tz}px) rotateY(\${ry}deg)\`;
      el.style.opacity = opacity;
      el.style.filter = \`brightness(\${brightness})\`;
      el.style.zIndex = zi;
      el.style.pointerEvents = shown && opacity > 0.05 ? 'auto' : 'none';
    });
  }
}

// Initialize Components on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  new AccordionGallery('#scope-carousel');
  new CardSwap('.card-swap-container');
  new DepthCarousel('.depth-carousel');
});
