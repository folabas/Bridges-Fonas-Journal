gsap.registerPlugin(ScrollTrigger);

// ──────────────────────────────────────────────
// HERO ANIMATIONS
// ──────────────────────────────────────────────
const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

heroTl
  .from('.hero-badge', {
    opacity: 0,
    y: 30,
    scale: 0.9,
    duration: 0.8,
    delay: 0.3
  })
  .from('.hero h1', {
    opacity: 0,
    y: 50,
    duration: 1,
  }, '-=0.4')
  .from('.hero h1 .accent', {
    opacity: 0,
    x: -30,
    duration: 0.6,
  }, '-=0.6')
  .from('.hero h1 em', {
    opacity: 0,
    x: 30,
    duration: 0.6,
  }, '-=0.4')
  .from('.hero-subtitle', {
    opacity: 0,
    y: 30,
    duration: 0.8,
  }, '-=0.3')
  .from('.hero-actions', {
    opacity: 0,
    y: 30,
    duration: 0.8,
  }, '-=0.4')
  .from('.hero-card', {
    opacity: 0,
    x: 60,
    scale: 0.95,
    duration: 1,
  }, '-=1.2')
  .from('.hero-card-header', {
    opacity: 0,
    y: -20,
    duration: 0.6,
  }, '-=0.6')
  .from('.card-title', {
    opacity: 0,
    y: 20,
    duration: 0.5,
  }, '-=0.4')
  .from('.card-desc', {
    opacity: 0,
    y: 20,
    duration: 0.5,
  }, '-=0.3')
  .from('.deadline-box', {
    opacity: 0,
    scale: 0.9,
    duration: 0.6,
  }, '-=0.2')
  .from('.editor-av', {
    opacity: 0,
    scale: 0,
    duration: 0.5,
    stagger: 0.15,
  }, '-=0.3');

// ──────────────────────────────────────────────
// SCOPE STRIP ANIMATION
// ──────────────────────────────────────────────
gsap.from('.scope-strip', {
  scrollTrigger: {
    trigger: '.scope-strip',
    start: 'top 90%',
    toggleActions: 'play none none reverse'
  },
  y: -30,
  opacity: 0,
  duration: 0.8,
  ease: 'power3.out'
});

gsap.from('.scope-tag', {
  scrollTrigger: {
    trigger: '.scope-strip',
    start: 'top 85%',
    toggleActions: 'play none none reverse'
  },
  opacity: 0,
  scale: 0.8,
  y: 20,
  duration: 0.5,
  stagger: 0.08,
  ease: 'back.out(1.7)'
});

// ──────────────────────────────────────────────
// SECTION HEADERS ANIMATION
// ──────────────────────────────────────────────
gsap.utils.toArray('.anim-section').forEach((section) => {
  gsap.from(section, {
    scrollTrigger: {
      trigger: section,
      start: 'top 85%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    x: -40,
    duration: 0.8,
    ease: 'power3.out'
  });
  
  gsap.from(section.querySelector('.section-line'), {
    scrollTrigger: {
      trigger: section,
      start: 'top 85%',
      toggleActions: 'play none none reverse'
    },
    scaleX: 0,
    transformOrigin: 'left center',
    duration: 1,
    delay: 0.3,
    ease: 'power3.out'
  });
});

// ──────────────────────────────────────────────
// CARDS ANIMATION - Fade up with stagger
// ──────────────────────────────────────────────
gsap.utils.toArray('.anim-card').forEach((card, index) => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: 'top 85%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    y: 60,
    scale: 0.97,
    duration: 0.9,
    delay: index * 0.1,
    ease: 'power3.out'
  });
});

// ──────────────────────────────────────────────
// SCOPE ITEMS - Staggered reveal
// ──────────────────────────────────────────────
gsap.from('.anim-scope', {
  scrollTrigger: {
    trigger: '.anim-scope',
    start: 'top 85%',
    toggleActions: 'play none none reverse'
  },
  opacity: 0,
  y: 40,
  duration: 0.6,
  ease: 'power3.out'
});

gsap.utils.toArray('.anim-scope-item').forEach((item, index) => {
  gsap.from(item, {
    scrollTrigger: {
      trigger: item,
      start: 'top 88%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    y: 50,
    scale: 0.95,
    duration: 0.7,
    delay: index * 0.12,
    ease: 'power3.out'
  });
});

// ──────────────────────────────────────────────
// GUIDELINES LIST ITEMS - Stagger animation
// ──────────────────────────────────────────────
gsap.utils.toArray('.anim-list-item').forEach((item, index) => {
  gsap.from(item, {
    scrollTrigger: {
      trigger: item,
      start: 'top 90%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    x: -40,
    duration: 0.6,
    delay: index * 0.1,
    ease: 'power3.out'
  });
});

// ──────────────────────────────────────────────
// SIDEBAR CARDS - Slide in from right
// ──────────────────────────────────────────────
gsap.utils.toArray('.anim-sidebar').forEach((card, index) => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: 'top 88%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    x: 50,
    duration: 0.8,
    delay: index * 0.15,
    ease: 'power3.out'
  });
});

// ──────────────────────────────────────────────
// INFO ITEMS - Stagger from bottom
// ──────────────────────────────────────────────
gsap.utils.toArray('.anim-info-item').forEach((item, index) => {
  gsap.from(item, {
    scrollTrigger: {
      trigger: item,
      start: 'top 92%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    y: 20,
    duration: 0.5,
    delay: index * 0.08,
    ease: 'power3.out'
  });
});

// ──────────────────────────────────────────────
// EDITOR ITEMS - Alternate slide
// ──────────────────────────────────────────────
gsap.utils.toArray('.anim-editor').forEach((editor, index) => {
  gsap.from(editor, {
    scrollTrigger: {
      trigger: editor,
      start: 'top 90%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    x: index % 2 === 0 ? -30 : 30,
    duration: 0.7,
    ease: 'power3.out'
  });
});

// ──────────────────────────────────────────────
// COUNTDOWN - Animate numbers
// ──────────────────────────────────────────────
ScrollTrigger.create({
  trigger: '.countdown-grid',
  start: 'top 85%',
  onEnter: () => {
    gsap.from('.countdown-unit', {
      scale: 0,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'back.out(1.7)'
    });
  },
  once: true
});

// ──────────────────────────────────────────────
// PARALLAX EFFECT ON HERO BACKGROUND
// ──────────────────────────────────────────────
gsap.to('.hero::before', {
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: 1
  },
  yPercent: 30,
  ease: 'none'
});

// ──────────────────────────────────────────────
// FOOTER ACCENT BAR - Width animation
// ──────────────────────────────────────────────
ScrollTrigger.create({
  trigger: 'footer',
  start: 'top 90%',
  onEnter: () => {
    gsap.from('.footer-accent-bar', {
      width: 0,
      duration: 1,
      ease: 'power3.out'
    });
    
    gsap.from('.footer-logo', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out'
    });
  },
  once: true
});

// ──────────────────────────────────────────────
// TOP BAR - Slide down animation
// ──────────────────────────────────────────────
gsap.from('.top-bar', {
  y: -50,
  opacity: 0,
  duration: 0.8,
  ease: 'power3.out'
});

// ──────────────────────────────────────────────
// HEADER - Blur in effect
// ──────────────────────────────────────────────
gsap.from('header', {
  opacity: 0,
  y: -20,
  duration: 0.8,
  delay: 0.5,
  ease: 'power3.out'
});

// ──────────────────────────────────────────────
// BUTTONS - Hover effect
// ──────────────────────────────────────────────
const buttons = document.querySelectorAll('.btn, .submit-btn');
buttons.forEach(btn => {
  btn.addEventListener('mouseenter', () => {
    gsap.to(btn, {
      scale: 1.05,
      duration: 0.3,
      ease: 'power2.out'
    });
  });
  
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out'
    });
  });
});

// ──────────────────────────────────────────────
// SCOPE ITEMS - 3D tilt on hover
// ──────────────────────────────────────────────
const scopeItems = document.querySelectorAll('.scope-item');
scopeItems.forEach(item => {
  item.addEventListener('mousemove', (e) => {
    const rect = item.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 25;
    const rotateY = (centerX - x) / 25;
    
    gsap.to(item, {
      rotateX: rotateX,
      rotateY: rotateY,
      transformPerspective: 1000,
      duration: 0.3,
      ease: 'power2.out'
    });
  });
  
  item.addEventListener('mouseleave', () => {
    gsap.to(item, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: 'power2.out'
    });
  });
});

// ──────────────────────────────────────────────
// SMOOTH SCROLL TO SECTIONS
// ──────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ──────────────────────────────────────────────
// SCROLL INDICATOR ANIMATION
// ──────────────────────────────────────────────
gsap.to('.hero-badge-dot', {
  scale: 1.3,
  duration: 0.8,
  repeat: -1,
  yoyo: true,
  ease: 'power1.inOut'
});

// ──────────────────────────────────────────────
// TEXT REVEAL ANIMATION ON HEADINGS
// ──────────────────────────────────────────────
const headings = document.querySelectorAll('.card h2, .card h3, .message-card h3');
headings.forEach(heading => {
  gsap.from(heading, {
    scrollTrigger: {
      trigger: heading,
      start: 'top 90%',
    },
    opacity: 0,
    y: 30,
    duration: 0.8,
    ease: 'power3.out'
  });
});

// ──────────────────────────────────────────────
// CARD HOVER - Subtle lift effect
// ──────────────────────────────────────────────
const cards = document.querySelectorAll('.card');
cards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    gsap.to(card, {
      y: -6,
      duration: 0.4,
      ease: 'power2.out'
    });
  });
  
  card.addEventListener('mouseleave', () => {
    gsap.to(card, {
      y: 0,
      duration: 0.4,
      ease: 'power2.out'
    });
  });
});

// ──────────────────────────────────────────────
// SIDEBAR CARD HOVER
// ──────────────────────────────────────────────
const sidebarCards = document.querySelectorAll('.sidebar-card');
sidebarCards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    gsap.to(card, {
      y: -4,
      duration: 0.3,
      ease: 'power2.out'
    });
  });
  
  card.addEventListener('mouseleave', () => {
    gsap.to(card, {
      y: 0,
      duration: 0.3,
      ease: 'power2.out'
    });
  });
});

// ──────────────────────────────────────────────
// LOGO HOVER EFFECT
// ──────────────────────────────────────────────
const logo = document.querySelector('.logo');
if (logo) {
  logo.addEventListener('mouseenter', () => {
    gsap.to('.logo-icon', {
      rotate: -5,
      scale: 1.05,
      duration: 0.3,
      ease: 'back.out(1.7)'
    });
  });
  
  logo.addEventListener('mouseleave', () => {
    gsap.to('.logo-icon', {
      rotate: 0,
      scale: 1,
      duration: 0.3,
      ease: 'power2.out'
    });
  });
}

// ──────────────────────────────────────────────
// PREFERS REDUCED MOTION CHECK
// ──────────────────────────────────────────────
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.globalTimeline.timeScale(0);
  ScrollTrigger.getAll().forEach(st => st.kill());
}

// ──────────────────────────────────────────────
// SCROLL PROGRESS BAR (optional visual element)
// ──────────────────────────────────────────────
const progressBar = document.createElement('div');
progressBar.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--green), var(--magenta));
  z-index: 1000;
  width: 0%;
  transition: width 0.1s ease;
`;
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;
  progressBar.style.width = scrollPercent + '%';
});
