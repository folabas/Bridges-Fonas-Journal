// js/main.js

document.addEventListener('DOMContentLoaded', () => {

  // --- Countdown Timer ---
  const deadline = new Date('2026-06-30T23:59:59');
  function updateTimer() {
    const now = new Date();
    const diff = deadline - now;
    const status = document.getElementById('cd-status');
    
    if (diff <= 0) {
      const dEl = document.getElementById('cd-days');
      if (dEl) {
        dEl.textContent = '00';
        document.getElementById('cd-hours').textContent = '00';
        document.getElementById('cd-mins').textContent = '00';
        document.getElementById('cd-secs').textContent = '00';
      }
      if (status) status.textContent = 'Submission deadline has passed';
      return;
    }
    
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    
    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minsEl = document.getElementById('cd-mins');
    const secsEl = document.getElementById('cd-secs');
    
    if (daysEl) daysEl.textContent = String(d).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(h).padStart(2, '0');
    if (minsEl) minsEl.textContent = String(m).padStart(2, '0');
    if (secsEl) secsEl.textContent = String(s).padStart(2, '0');
    
    setTimeout(updateTimer, 1000);
  }
  updateTimer();

  // --- Mobile Sidebar Toggle ---
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const mobileNav = document.querySelector('.mobile-sidebar');
  const mobileOverlay = document.querySelector('.mobile-sidebar-overlay');
  const mobileClose = document.querySelector('.mobile-nav-toggle-close');
  
  if (mobileToggle && mobileNav && mobileOverlay) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileNav.classList.add('active');
      mobileOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
    
    const closeSidebar = () => {
      mobileNav.classList.remove('active');
      mobileOverlay.classList.remove('active');
      document.body.style.overflow = '';
    };
    
    mobileOverlay.addEventListener('click', closeSidebar);
    if(mobileClose) mobileClose.addEventListener('click', closeSidebar);
    
    // Close sidebar on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeSidebar);
    });
  }

  // --- Navbar Scroll (Transparent to Pill) ---
  const header = document.getElementById('main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });



  const setupCarousel = () => {
    const carousel = document.getElementById('guidelines-carousel');
    const dots = document.querySelectorAll('#guidelines-pagination .page-dot');
    if (!carousel || dots.length === 0) return;

    // Use IntersectionObserver for perfect dot updates
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = Array.from(carousel.children).indexOf(entry.target);
          if (index !== -1) {
            dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
          }
        }
      });
    }, { root: carousel, threshold: 0.6 });

    Array.from(carousel.children).forEach(card => observer.observe(card));

    // Click listener on dots
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        const target = carousel.children[index];
        if(target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      });
    });
  };
  setupCarousel();

  // --- Latest Articles Fetcher ---
  const latestGrid = document.getElementById('latest-articles-grid');
  if (latestGrid) {
    const API = 'https://bridges-journal.onrender.com';
    // Use grid display for the wrapper
    latestGrid.style.display = 'grid';
    latestGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
    latestGrid.style.gap = '24px';

    fetch(`${API}/api/articles?page=1&limit=2`)
      .then(res => res.json())
      .then(data => {
        if (!data.articles || data.articles.length === 0) {
          latestGrid.innerHTML = '<div style="text-align:center; padding: 20px; color:var(--text-muted); width: 100%;">No articles published yet.</div>';
          return;
        }
        latestGrid.innerHTML = '';
        data.articles.forEach((a) => {
          const card = document.createElement('article');
          card.className = 'ac-card';
          card.innerHTML = `
            <div class="ac-thumb" style="${a.thumbnailUrl ? `background-image:url('${a.thumbnailUrl}')` : ''}">
              ${!a.thumbnailUrl ? '<i class="fa-solid fa-file-pdf ac-thumb-icon"></i>' : ''}
              <span class="ac-badge">${a.category || 'Research'}</span>
            </div>
            <div class="ac-body">
              <div class="ac-meta">${a.year || '2026'} &middot; Vol.&nbsp;${a.volume || '1'}, Issue&nbsp;${a.issue || '1'}</div>
              <h3 class="ac-title">${a.title}</h3>
              <p class="ac-authors">${(a.authors || []).join(', ')}</p>
            </div>
            <div class="ac-footer">
              <a href="articles.html?id=${a._id}" class="ac-btn-view" style="text-decoration:none; display:inline-flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-eye"></i> View Article
              </a>
            </div>
          `;
          latestGrid.appendChild(card);
        });
      })
      .catch(err => {
        latestGrid.innerHTML = '<div style="text-align:center; padding: 20px; color:var(--danger); width: 100%;">Failed to load latest articles.</div>';
      });
  }

});

// Coming Soon Modal logic
window.openComingSoonModal = function() {
  const modal = document.getElementById('coming-soon-modal');
  const overlay = document.getElementById('coming-soon-overlay');
  if (modal && overlay) {
    modal.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.closeComingSoonModal = function() {
  const modal = document.getElementById('coming-soon-modal');
  const overlay = document.getElementById('coming-soon-overlay');
  if (modal && overlay) {
    modal.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
};

// Esc key listener for modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeComingSoonModal();
  }
});
