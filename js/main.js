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

  // --- Articles Fetcher (homepage, all articles with modal) ---
  const latestGrid = document.getElementById('latest-articles-grid');
  if (latestGrid) {
    const API = window.__API || 'https://bridges-journal.onrender.com';
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      latestGrid.classList.add('scroll-stack-container');
    } else {
      latestGrid.style.display = 'grid';
      latestGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
      latestGrid.style.gap = '24px';
    }

    // Show "waking up" hint if still loading after 5s (Render cold start)
    const wakeTimer = setTimeout(() => {
      const hint = document.getElementById('articles-load-hint');
      if (hint) hint.style.display = 'block';
    }, 5000);

    // Reuse the pre-fired fetch from <head> — no second request needed
    const dataPromise = (window.__articlesFetch instanceof Promise)
      ? window.__articlesFetch
      : fetch(`${API}/api/articles?page=1&limit=100`).then(r => r.json()).catch(() => null);

    dataPromise.then(data => {
      clearTimeout(wakeTimer);
      if (!data || !data.articles || data.articles.length === 0) {
        latestGrid.innerHTML = '<div style="text-align:center; padding: 20px; color:var(--text-muted); grid-column:1/-1;">No articles published yet.</div>';
        return;
      }
      latestGrid.innerHTML = '';
      data.articles.forEach((a, index) => {
        const card = document.createElement('article');
        card.className = 'ac-card';
        if (isMobile) {
          card.classList.add('scroll-stack-card');
          card.style.setProperty('--mobile-top', `${80 + (index * 24)}px`);
          card.style.setProperty('--mobile-z', index + 1);
          if (index > 0) card.style.setProperty('--mobile-mt', '-16px');
        }
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
            <button class="ac-btn-view">
              <i class="fa-solid fa-eye"></i> View Article
            </button>
          </div>
        `;
        card.querySelector('.ac-btn-view').addEventListener('click', () => openArticleModal(a));
        latestGrid.appendChild(card);
      });
    }).catch(() => {
      clearTimeout(wakeTimer);
      latestGrid.innerHTML = `
        <div style="text-align:center;padding:32px;grid-column:1/-1;">
          <i class="fa-solid fa-server" style="font-size:40px;color:var(--text-muted);margin-bottom:12px;"></i>
          <p style="color:var(--text-muted);margin-bottom:16px;">Couldn't reach the server.</p>
          <button onclick="location.reload()" style="padding:10px 24px;border-radius:50px;border:none;background:var(--blue);color:#fff;cursor:pointer;font-weight:600;">Retry</button>
        </div>`;
    });
  }

  // --- Article Modal logic (homepage) ---
  const modalEl = document.getElementById('article-modal');
  const closeBtn = document.getElementById('am-close-btn');
  if (modalEl && closeBtn) {
    closeBtn.addEventListener('click', () => {
      modalEl.classList.remove('active');
      document.body.style.overflow = '';
    });
    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) {
        modalEl.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  window.openArticleModal = function(a) {
    const API = 'https://bridges-journal.onrender.com';
    const modal = document.getElementById('article-modal');
    if (!modal) return;

    const thumb = document.getElementById('am-thumb');
    if (thumb) {
      thumb.style.backgroundImage = a.thumbnailUrl ? `url('${a.thumbnailUrl}')` : '';
      thumb.innerHTML = !a.thumbnailUrl ? '<i class="fa-solid fa-file-pdf" style="font-size:48px;opacity:.4;"></i>' : '';
    }

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || '—'; };
    set('am-year',   a.year);
    set('am-vol',    a.volume ? `Vol. ${a.volume}` : '—');
    set('am-issue',  a.issue  ? `Issue ${a.issue}` : '—');
    set('am-pages',  a.pages);
    set('am-title',  a.title);
    set('am-authors', (a.authors || []).join(', '));
    set('am-abstract', a.abstract);

    const catEl = document.getElementById('am-category');
    if (catEl) catEl.textContent = a.category || 'Research';

    const kwEl = document.getElementById('am-keywords');
    if (kwEl) {
      kwEl.innerHTML = a.keywords && a.keywords.length
        ? a.keywords.map(k => `<span class="am-kw-chip">${escHtml(k)}</span>`).join('')
        : '';
    }

    document.getElementById('am-actions').innerHTML = `
      <button class="am-btn-dl" id="am-download-btn">
        <i class="fa-solid fa-download"></i> Download PDF
      </button>
    `;
    document.getElementById('am-download-btn').addEventListener('click', async () => {
      const btn = document.getElementById('am-download-btn');
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Preparing…';
      try {
        const res = await fetch(`${API}/api/articles/${a._id}/download`, { method: 'POST' });
        const data = await res.json();
        const link = document.createElement('a');
        link.href = data.pdfUrl;
        link.download = a.title.replace(/[^a-z0-9]/gi, '_') + '.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        const dlCount = document.getElementById('am-dl-count');
        if (dlCount) dlCount.textContent = `${data.downloads} downloads`;
      } catch {
        alert('Download failed. Please try again.');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-download"></i> Download PDF';
      }
    });

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  // Esc closes article modal too
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('article-modal');
      if (modal && modal.classList.contains('active')) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  });

}); // end DOMContentLoaded

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
