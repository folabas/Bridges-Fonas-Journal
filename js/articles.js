document.addEventListener('DOMContentLoaded', () => {
  const articlesGrid = document.getElementById('articles-grid');
  const paginationContainer = document.getElementById('archive-pagination');
  const searchInput = document.getElementById('article-search');
  const yearFilter = document.getElementById('year-filter');

  if (!articlesGrid) return; // Only run on articles page

  // We are removing 'scroll-stack-container' class to use standard grid layout for new cards
  articlesGrid.classList.remove('scroll-stack-container');
  articlesGrid.style.display = 'grid';
  articlesGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(320px, 1fr))';
  articlesGrid.style.gap = '24px';

  let currentPage = 1;
  const isMobile = window.innerWidth <= 768;
  // Feedback: max of 5 articles per page on mobile view
  const limit = isMobile ? 5 : 12;

  let currentSearch = '';
  let currentYear = '';

  async function fetchArticles() {
    try {
      articlesGrid.innerHTML = `
        <div class="skeleton-card"><div class="skeleton-box skeleton-title"></div><div class="skeleton-box skeleton-text"></div><div class="skeleton-box skeleton-text short"></div><div class="skeleton-box skeleton-btn"></div></div>
        <div class="skeleton-card"><div class="skeleton-box skeleton-title"></div><div class="skeleton-box skeleton-text"></div><div class="skeleton-box skeleton-text short"></div><div class="skeleton-box skeleton-btn"></div></div>
        <div class="skeleton-card"><div class="skeleton-box skeleton-title"></div><div class="skeleton-box skeleton-text"></div><div class="skeleton-box skeleton-text short"></div><div class="skeleton-box skeleton-btn"></div></div>
      `;
      
      let url = `https://bridges-journal.onrender.com/api/articles?page=${currentPage}&limit=${limit}`;
      if (currentSearch) url += `&search=${encodeURIComponent(currentSearch)}`;
      if (currentYear) url += `&year=${currentYear}`;

      // Simulate a fetch to the backend. In production, this hits our Node.js server.
      // If the server isn't running yet, we show a graceful fallback for demonstration.
      let res;
      try {
        res = await fetch(url);
      } catch (e) {
        renderFallback();
        return;
      }

      if (res.ok) {
        const data = await res.json();
        renderArticles(data.articles);
        renderPagination(data.page, data.pages);
      } else {
        renderFallback();
      }
    } catch (error) {
      console.error(error);
      renderFallback();
    }
  }

  function renderArticles(articles) {
    if (!articles || articles.length === 0) {
      articlesGrid.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-folder-open" style="font-size: 64px; color: var(--text-muted); margin-bottom: 24px;"></i>
          <h3>No Articles Found</h3>
          <p>We couldn't find any articles matching your search criteria. Try adjusting your filters.</p>
        </div>
      `;
      return;
    }

    articlesGrid.innerHTML = '';
    articles.forEach(article => {
      const card = document.createElement('div');
      card.className = 'article-card-new anim-card';
      // Use Cloudinary thumbnail, or fallback dark gradient
      const bgImg = article.thumbnailUrl ? `url('${article.thumbnailUrl}')` : 'none';
      
      card.innerHTML = `
        <div class="article-card-bg" style="background-image: ${bgImg};"></div>
        <div class="article-card-overlay"></div>
        <div class="article-card-content">
          <div class="article-meta-chips">
            <span class="meta-chip category">${article.category || 'Research'}</span>
            <span class="meta-chip">${article.year || '2026'}</span>
          </div>
          <h3>${article.title}</h3>
          <div class="article-authors">${(article.authors || []).join(', ')} · Vol. ${article.volume || '1'}, No. ${article.issue || '1'}</div>
          <div class="article-abstract">${article.abstract || 'No abstract available.'}</div>
          <div class="article-actions">
            <button class="btn btn-primary" onclick="openPdfModal('${article.pdfUrl}', '${article.title.replace(/'/g, "\\'")}')">View PDF <i class="fa-solid fa-arrow-up-right-from-square"></i></button>
          </div>
        </div>
      `;
      articlesGrid.appendChild(card);
    });
  }

  function renderPagination(page, totalPages) {
    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    let html = '<div class="pagination-controls">';
    html += `<button class="page-btn" ${page === 1 ? 'disabled' : ''} onclick="window.changePage(${page - 1})"><i class="fa-solid fa-chevron-left"></i></button>`;
    html += `<span class="page-info">Page ${page} of ${totalPages}</span>`;
    html += `<button class="page-btn" ${page === totalPages ? 'disabled' : ''} onclick="window.changePage(${page + 1})"><i class="fa-solid fa-chevron-right"></i></button>`;
    html += '</div>';

    paginationContainer.innerHTML = html;
  }

  window.changePage = function(newPage) {
    currentPage = newPage;
    fetchArticles();
    document.getElementById('archive').scrollIntoView({ behavior: 'smooth' });
  };

  function renderFallback() {
    articlesGrid.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-server" style="font-size: 64px; color: var(--danger); margin-bottom: 24px;"></i>
        <h3>Server Connection Error</h3>
        <p>We are currently unable to reach the database. Please check your connection or try again later.</p>
      </div>
    `;
  }

  // Event Listeners for Filters
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      currentPage = 1;
      // In production, add debounce here
      setTimeout(fetchArticles, 500); 
    });
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', (e) => {
      currentYear = e.target.value;
      currentPage = 1;
      fetchArticles();
    });
  }

  // Initial fetch
  fetchArticles();
});

// PDF Modal Logic
window.openPdfModal = function(pdfUrl, title) {
  const modal = document.getElementById('pdf-viewer-modal');
  const overlay = document.getElementById('pdf-viewer-overlay');
  const titleEl = document.getElementById('pdf-modal-title');
  const bodyEl = document.getElementById('pdf-modal-body');
  const downloadBtn = document.getElementById('pdf-download-btn');

  if (modal && overlay) {
    titleEl.textContent = title;
    downloadBtn.href = pdfUrl;
    
    // Check if mobile. If mobile, iframe PDF viewing is often flaky.
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      bodyEl.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; padding:20px; text-align:center;">
          <i class="fa-solid fa-file-pdf" style="font-size: 4rem; color: var(--blue); margin-bottom: 16px;"></i>
          <h4>Preview not available on mobile</h4>
          <p style="color: var(--text-muted); margin-bottom: 24px;">Please download the PDF to read the full article.</p>
          <a href="${pdfUrl}" class="btn btn-primary" download target="_blank">Download PDF</a>
        </div>
      `;
    } else {
      bodyEl.innerHTML = `<iframe src="${pdfUrl}#toolbar=0" frameborder="0"></iframe>`;
    }

    modal.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.closePdfModal = function() {
  const modal = document.getElementById('pdf-viewer-modal');
  const overlay = document.getElementById('pdf-viewer-overlay');
  const bodyEl = document.getElementById('pdf-modal-body');

  if (modal && overlay) {
    modal.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    // Clear iframe to stop loading/audio
    setTimeout(() => {
      if (bodyEl) bodyEl.innerHTML = '';
    }, 300);
  }
};
