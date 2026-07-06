// js/animations.js

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. THREE.JS ABSTRACT BACKGROUND
  // ==========================================
  const canvas = document.getElementById('bg-canvas');
  if (canvas && typeof THREE !== 'undefined') {
    const scene = new THREE.Scene();
    
    // Very subtle fog to blend into the light background
    scene.fog = new THREE.FogExp2(0xF8F7F4, 0.002);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.z = 30;

    // Create particles
    const geometry = new THREE.BufferGeometry();
    const particlesCount = 800;
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 100;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.15,
      color: 0x3B5BDB,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    
    const particlesMesh = new THREE.Points(geometry, material);
    scene.add(particlesMesh);
    
    const sphereGeom = new THREE.IcosahedronGeometry(15, 1);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x3B5BDB,
      wireframe: true,
      transparent: true,
      opacity: 0.05
    });
    const sphere = new THREE.Mesh(sphereGeom, sphereMat);
    sphere.position.set(20, 0, -10);
    scene.add(sphere);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    
    document.addEventListener('mousemove', (event) => {
      mouseX = (event.clientX - windowHalfX);
      mouseY = (event.clientY - windowHalfY);
    });

    // Animation Loop
    const clock = new THREE.Clock();
    
    const tick = () => {
      const elapsedTime = clock.getElapsedTime();
      
      targetX = mouseX * 0.001;
      targetY = mouseY * 0.001;
      
      particlesMesh.rotation.y = elapsedTime * 0.05;
      particlesMesh.rotation.x = elapsedTime * 0.02;
      
      sphere.rotation.y += 0.002;
      sphere.rotation.x += 0.001;
      
      camera.position.x += (mouseX * 0.01 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 0.01 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);
      
      renderer.render(scene, camera);
      window.requestAnimationFrame(tick);
    }
    tick();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // ==========================================
  // 2. GSAP ANIMATIONS
  // ==========================================
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Hero Text Animations (Blur in / Slide up)
    gsap.fromTo(".hero-switching-text-container", 
      { opacity: 0, y: -20, filter: "blur(10px)" }, 
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 1, ease: "power3.out", delay: 0.1 }
    );

    gsap.fromTo(".hero-title", 
      { opacity: 0, y: 30, filter: "blur(10px)", scale: 0.95 }, 
      { opacity: 1, y: 0, filter: "blur(0px)", scale: 1, duration: 1.2, ease: "power3.out", delay: 0.3 }
    );
    
    gsap.fromTo(".hero-title-sub", 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.5 }
    );

    gsap.fromTo(".hero-subtitle", 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.7 }
    );
    
    gsap.fromTo(".hero-actions", 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.9 }
    );
    
    gsap.fromTo(".hero-card", 
      { opacity: 0, y: 40, scale: 0.98 }, 
      { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "power4.out", delay: 1.1 }
    );

    // Fade up sections (General)
    const animCards = document.querySelectorAll('.anim-card');
    animCards.forEach(card => {
      gsap.fromTo(card, 
        { opacity: 0, y: 40 }, 
        { 
          opacity: 1, 
          y: 0, 
          duration: 1, 
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          }
        }
      );
    });

    // Sidebar Cards staggered
    gsap.fromTo(".anim-sidebar",
      { opacity: 0, x: 30 },
      { 
        opacity: 1, 
        x: 0, 
        duration: 0.8, 
        stagger: 0.15, 
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".sidebar",
          start: "top 85%",
        }
      }
    );

    // Taped Footer Animation
    gsap.fromTo(".footer-large-name",
      { opacity: 0, y: 100 },
      {
        opacity: 0.03, // Returns to target opacity in CSS
        y: 0,
        duration: 1.5,
        ease: "power4.out",
        scrollTrigger: {
          trigger: ".taped-footer",
          start: "top 90%"
        }
      }
    );
  }

  // ==========================================
  // 3. SWITCHING TEXT LOGIC
  // ==========================================
  const switchingTextEl = document.getElementById('switching-text');
  if (switchingTextEl && typeof gsap !== 'undefined') {
    const texts = ["Call for Papers", "Volume 1, Issue 1"];
    let currentIndex = 0;

    setInterval(() => {
      gsap.to(switchingTextEl, {
        opacity: 0,
        y: -10,
        duration: 0.3,
        onComplete: () => {
          currentIndex = (currentIndex + 1) % texts.length;
          switchingTextEl.textContent = texts[currentIndex];
          gsap.fromTo(switchingTextEl, 
            { opacity: 0, y: 10 }, 
            { opacity: 1, y: 0, duration: 0.3 }
          );
        }
      });
    }, 4000);
  }

  // ==========================================
  // 4. CAROUSEL LOGIC (Auto-swipe & Pagination)
  // ==========================================
  const carousel = document.getElementById('scope-carousel');
  const pagination = document.getElementById('scope-pagination');
  
  if (carousel && pagination) {
    const cards = Array.from(carousel.children);
    const cardWidth = cards[0].offsetWidth + 24; // width + gap
    const visibleCards = Math.floor(carousel.offsetWidth / cardWidth);
    const totalPages = Math.ceil(cards.length / (visibleCards || 1));
    
    let currentPage = 0;

    // Create dots
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('div');
      dot.className = `page-dot ${i === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => goToPage(i));
      pagination.appendChild(dot);
    }
    const dots = Array.from(pagination.children);

    function updateDots(index) {
      dots.forEach(d => d.classList.remove('active'));
      if(dots[index]) dots[index].classList.add('active');
    }

    function goToPage(index) {
      currentPage = index;
      const scrollPos = index * cardWidth * (visibleCards || 1);
      carousel.scrollTo({
        left: scrollPos,
        behavior: 'smooth'
      });
      updateDots(currentPage);
    }

    // Auto-swipe every 3 seconds
    let autoSwipe = setInterval(() => {
      currentPage = (currentPage + 1) % totalPages;
      goToPage(currentPage);
    }, 3000);

    // Pause auto-swipe on interaction
    carousel.addEventListener('mouseenter', () => clearInterval(autoSwipe));
    carousel.addEventListener('touchstart', () => clearInterval(autoSwipe), {passive: true});
    
    carousel.addEventListener('mouseleave', () => {
      autoSwipe = setInterval(() => {
        currentPage = (currentPage + 1) % totalPages;
        goToPage(currentPage);
      }, 3000);
    });
    
    // Update active dot on manual scroll
    carousel.addEventListener('scroll', () => {
      const scrollLeft = carousel.scrollLeft;
      const index = Math.round(scrollLeft / (cardWidth * (visibleCards || 1)));
      if (index !== currentPage && index < totalPages) {
        currentPage = index;
        updateDots(currentPage);
      }
    }, {passive: true});
  }

});
