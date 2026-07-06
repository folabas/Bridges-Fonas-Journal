// js/main.js

document.addEventListener('DOMContentLoaded', () => {

  // --- Countdown Timer ---
  const deadline = new Date('2026-06-30T23:59:59');
  function updateTimer() {
    const now = new Date();
    const diff = deadline - now;
    const status = document.getElementById('cd-status');
    
    if (diff <= 0) {
      document.getElementById('cd-days').textContent = '00';
      document.getElementById('cd-hours').textContent = '00';
      document.getElementById('cd-mins').textContent = '00';
      document.getElementById('cd-secs').textContent = '00';
      if (status) status.textContent = 'Submission deadline has passed';
      return;
    }
    
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    
    document.getElementById('cd-days').textContent = String(d).padStart(2, '0');
    document.getElementById('cd-hours').textContent = String(h).padStart(2, '0');
    document.getElementById('cd-mins').textContent = String(m).padStart(2, '0');
    document.getElementById('cd-secs').textContent = String(s).padStart(2, '0');
    
    setTimeout(updateTimer, 1000);
  }
  updateTimer();

  // --- Mobile Card Nav Toggle ---
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav-card');
  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileNav.classList.toggle('active');
    });
    
    document.addEventListener('click', (e) => {
      if (!mobileNav.contains(e.target) && !mobileToggle.contains(e.target)) {
        mobileNav.classList.remove('active');
      }
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
  const articlesData = [
    { title: "Machine Learning in Bioinformatics: A Review", author: "Dr. A. Smith", year: "2026", abstract: "This review explores recent advancements in applying machine learning algorithms to sequence analysis and structural biology." },
    { title: "Sustainable Bioremediation of Heavy Metals", author: "Prof. O. Ladokun", year: "2026", abstract: "Investigating the use of indigenous microbial strains for the bioremediation of lead and cadmium in contaminated soils." },
    { title: "Quantum Computing Algorithms for Optimization", author: "Dr. W. Sakpere", year: "2026", abstract: "A novel approach to solving NP-hard optimization problems using near-term quantum devices." },
    { title: "Evaluating Dietary Antioxidants", author: "Dr. B. Johnson", year: "2025", abstract: "A comprehensive study on the bioavailability and efficacy of natural antioxidants extracted from local flora." },
    { title: "Cybersecurity in IoT Healthcare Devices", author: "Prof. M. Adebayo", year: "2025", abstract: "Analyzing vulnerabilities in consumer health IoT devices and proposing a lightweight encryption protocol." },
    { title: "Nanomaterials for Solar Cell Efficiency", author: "Dr. K. Lee", year: "2026", abstract: "Enhancing the photovoltaic efficiency of perovskite solar cells using engineered carbon nanotubes." },
    { title: "Epidemiological Modelling of Viral Outbreaks", author: "Prof. S. Gupta", year: "2026", abstract: "A stochastic model for predicting the spread of respiratory viruses in high-density urban populations." },
    { title: "Advancements in Synthetic Biology", author: "Dr. E. Wong", year: "2025", abstract: "Design and construction of novel biological parts for targeted drug delivery systems." },
    { title: "AI-Driven Climate Change Prediction", author: "Prof. J. Doe", year: "2026", abstract: "Utilizing deep learning models to improve the accuracy of short-term regional climate predictions." },
    { title: "Biopolymer Alternatives to Single-Use Plastics", author: "Dr. P. Okon", year: "2025", abstract: "Development and characterization of biodegradable polymers derived from cassava starch." },
    { title: "Cryptographic Protocols for Blockchain", author: "Prof. L. Chen", year: "2026", abstract: "A survey of zero-knowledge proofs and their application in enhancing privacy on public ledgers." },
    { title: "Ethnomedicinal Plants of South-West Nigeria", author: "Dr. A. Ojo", year: "2025", abstract: "Documentation and phytochemical analysis of plants commonly used in traditional medicine." }
  ];

  const archiveGrid = document.getElementById('articles-grid');
  const paginationContainer = document.getElementById('archive-pagination');
  
  let currentPage = 1;
  let wasMobile = window.innerWidth <= 768;
  const isMobile = wasMobile; // Alias for itemsPerPage logic
  const itemsPerPage = isMobile ? 4 : 9;

  function initScrollStacks() {
    if (window.innerWidth > 768) return;
    const stacks = document.querySelectorAll('.scroll-stack-container');
    stacks.forEach(stack => {
      const cards = stack.children;
      Array.from(cards).forEach((card, i) => {
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

});
