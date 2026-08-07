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


  // --- ARCHIVE PAGINATION & RENDERING ---
  let allArticles = []; // raw fetched data
  let articlesData = []; // filtered/searched data

  const archiveGrid = document.getElementById('articles-grid');
  const paginationContainer = document.getElementById('archive-pagination');
  const searchInput = document.getElementById('article-search');
  const yearFilter = document.getElementById('year-filter');
  
  let currentPage = 1;
  let wasMobile = window.innerWidth <= 768;
  const isMobile = wasMobile; // Alias for itemsPerPage logic
  const itemsPerPage = isMobile ? 4 : 9;

  // Fetch articles from mock backend
  async function fetchArticles() {
    if (!archiveGrid) return;
    try {
      const res = await fetch('http://localhost:5000/api/articles');
      allArticles = await res.json();
      articlesData = [...allArticles];
      renderArticles(1);
    } catch (err) {
      console.error('Error fetching articles:', err);
      archiveGrid.innerHTML = '<p style="color:red; text-align:center;">Failed to load articles. Ensure backend is running.</p>';
    }
  }

  // Filter/Search Logic
  function applyFilters() {
    if (!archiveGrid) return;
    const term = searchInput.value.toLowerCase();
    const year = yearFilter.value;
    
    articlesData = allArticles.filter(a => {
      const matchSearch = a.title.toLowerCase().includes(term) || a.author.toLowerCase().includes(term) || a.abstract.toLowerCase().includes(term);
      const matchYear = year ? a.year === year : true;
      return matchSearch && matchYear;
    });
    
    currentPage = 1;
    renderArticles(currentPage);
  }

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (yearFilter) yearFilter.addEventListener('change', applyFilters);

  if (archiveGrid) {
    fetchArticles();
  }

  function initScrollStacks() {
    destroyScrollStacks();
    if (window.innerWidth > 1024) return;
    const stacks = document.querySelectorAll('.scroll-stack-container');
    stacks.forEach(stack => {
      const cards = stack.children;
      Array.from(cards).forEach((card, i) => {
        // Skip comment nodes, though children only returns elements
        card.classList.add('scroll-stack-card');
        card.style.setProperty('--mobile-top', `calc(7rem + ${i * 14}px)`);
        card.style.setProperty('--mobile-z', i + 10);
        card.style.setProperty('--mobile-mt', i === 0 ? '0' : '2.5rem');
      });
    });
  }

  function destroyScrollStacks() {
    document.querySelectorAll('.scroll-stack-card').forEach(c => {
      c.classList.remove('scroll-stack-card');
      c.style.removeProperty('--mobile-top');
      c.style.removeProperty('--mobile-z');
      c.style.removeProperty('--mobile-mt');
    });
  }

  // Call immediately and on resize
  initScrollStacks();
  window.addEventListener('resize', initScrollStacks);

  function renderArticles(page) {
    if (!archiveGrid) return;
    archiveGrid.innerHTML = '';
    
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = articlesData.slice(startIndex, endIndex);

    pageItems.forEach(article => {
      const card = document.createElement('div');
      card.className = 'archive-card glass-card';
      
      card.innerHTML = `
        <div class="archive-preview">
          <div class="archive-preview-placeholder">
            <i class="fa-solid fa-file-pdf"></i>
            <span>PDF</span>
          </div>
        </div>
        <div class="archive-body">
          <div class="archive-meta">
            <span class="article-year">${article.year}</span>
            <span class="article-type">Research Article</span>
          </div>
          <h4 class="article-title">${article.title}</h4>
          <div class="article-author">${article.author}</div>
          <p class="article-abstract">${article.abstract}</p>
          <div class="article-footer">
            <a href="#" class="download-btn">Download PDF <i class="fa-solid fa-download"></i></a>
          </div>
        </div>
      `;
      archiveGrid.appendChild(card);
    });

    renderPagination();
    // Re-apply scroll stack logic to newly rendered cards
    initScrollStacks();
  }

  function renderPagination() {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';
    
    const totalPages = Math.ceil(articlesData.length / itemsPerPage);
    if (totalPages <= 1) return;

    // Prev Button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-arrow';
    prevBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderArticles(currentPage);
      }
    });
    paginationContainer.appendChild(prevBtn);

    // Info text
    const infoText = document.createElement('div');
    infoText.className = 'pagination-info';
    infoText.textContent = `Page ${currentPage} of ${totalPages}`;
    paginationContainer.appendChild(infoText);

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-arrow';
    nextBtn.innerHTML = '<i class="fa-solid fa-arrow-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderArticles(currentPage);
      }
    });
    paginationContainer.appendChild(nextBtn);
  }

  // Initial render
  renderArticles(currentPage);

  window.addEventListener('resize', () => {
    const nowMobile = window.innerWidth <= 768;
    
    if (wasMobile !== nowMobile) {
      if (nowMobile) {
        initScrollStacks();
      } else {
        destroyScrollStacks();
      }
      // Reload page or force complete re-render because pagination logic changes
      window.location.reload(); 
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

});
/
