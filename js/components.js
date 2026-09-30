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

document.addEventListener('DOMContentLoaded', () => {
  new AccordionGallery('#scope-carousel');
});
