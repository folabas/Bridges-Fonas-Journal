// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});

// Countdown Timer
(function() {
  const deadline = new Date('2026-06-30T23:59:59');
  
  function update() {
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
    
    setTimeout(update, 1000);
  }
  
  update();
})();

// Archive Section - Google Drive Integration
(function() {
  // ============================================
  // CONFIGURATION - UPDATE THIS WITH YOUR DATA
  // ============================================
  
  // Google Drive Folder ID - Replace with your actual folder ID
  // The folder ID is the long string in your Google Drive share URL:
  // https://drive.google.com/drive/folders/[FOLDER_ID_HERE]
  const GOOGLE_DRIVE_FOLDER_ID = 'PLACEHOLDER_FOLDER_ID';
  
  // Alternative: Direct folder URL
  const GOOGLE_DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/PLACEHOLDER_FOLDER_ID';
  
  // Set to true to use Google Drive API, false to use sample data
  const USE_GOOGLE_DRIVE_API = false;
  
  // Google Drive API Key (optional - for public folders)
  const GOOGLE_API_KEY = 'YOUR_API_KEY_HERE';
  
  // ============================================
  // SAMPLE DATA - For demonstration
  // ============================================
  const sampleArticles = [
    {
      id: '1',
      title: 'Advances in Natural Product Chemistry: A Comprehensive Review',
      author: 'Dr. Adebayo O. & Prof. Chinedu E.',
      date: '2026-03-15',
      year: '2026',
      abstract: 'This review explores recent developments in natural product chemistry, focusing on bioactive compounds from medicinal plants native to West Africa. The study highlights novel extraction techniques and their applications in pharmaceutical development.',
      pdfUrl: '#',
      thumbnail: null
    },
    {
      id: '2',
      title: 'Machine Learning Applications in Bioinformatics: Current Trends',
      author: 'Dr. Fatima K. & Dr. Emmanuel A.',
      date: '2026-02-28',
      year: '2026',
      abstract: 'An investigation into the integration of machine learning algorithms with bioinformatics workflows. This paper examines predictive models for protein structure prediction and gene expression analysis.',
      pdfUrl: '#',
      thumbnail: null
    },
    {
      id: '3',
      title: 'Environmental Impact Assessment of Industrial Wastewater in Lagos',
      author: 'Prof. Olumide S. & Dr. Amina B.',
      date: '2025-11-20',
      year: '2025',
      abstract: 'A critical analysis of industrial wastewater management practices in Lagos metropolitan area. The research evaluates heavy metal contamination levels and proposes sustainable remediation strategies.',
      pdfUrl: '#',
      thumbnail: null
    },
    {
      id: '4',
      title: 'Quantum Computing: Principles and Potential Applications',
      author: 'Dr. Chukwuemeka N.',
      date: '2025-09-10',
      year: '2025',
      abstract: 'An introductory exploration of quantum computing principles and their potential applications in solving complex computational problems. The paper discusses quantum bits, superposition, and entanglement.',
      pdfUrl: '#',
      thumbnail: null
    },
    {
      id: '5',
      title: 'Antimicrobial Resistance Patterns in Nigerian Healthcare Settings',
      author: 'Dr. Grace O. & Prof. Tunde A.',
      date: '2025-06-25',
      year: '2025',
      abstract: 'A multi-center study examining antimicrobial resistance patterns among common pathogenic bacteria in Nigerian hospitals. The research provides insights for empirical antibiotic therapy guidelines.',
      pdfUrl: '#',
      thumbnail: null
    },
  ];
  
  // ============================================
  // ARTICLES STATE
  // ============================================
  let allArticles = [];
  let displayedArticles = [];
  
  // ============================================
  // GOOGLE DRIVE API FUNCTIONS
  // ============================================
  
  async function fetchFromGoogleDrive() {
    if (GOOGLE_DRIVE_FOLDER_ID === 'PLACEHOLDER_FOLDER_ID') {
      console.warn('Please set your Google Drive Folder ID in the configuration.');
      return sampleArticles;
    }
    
    try {
      const url = `https://www.googleapis.com/drive/v3/files?q='${GOOGLE_DRIVE_FOLDER_ID}'+in+parents+and+mimeType='application/pdf'&key=${GOOGLE_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.files && data.files.length > 0) {
        return data.files.map(file => ({
          id: file.id,
          title: file.name.replace('.pdf', '').replace(/_/g, ' '),
          author: 'Author Not Available',
          date: file.createdTime ? new Date(file.createdTime).toISOString().split('T')[0] : '',
          year: file.createdTime ? new Date(file.createdTime).getFullYear().toString() : '',
          abstract: 'No abstract available. Please download the full article for details.',
          pdfUrl: `https://drive.google.com/file/d/${file.id}/view`,
          thumbnail: `https://drive.google.com/thumbnail?id=${file.id}&sz=w400`
        }));
      }
      return sampleArticles;
    } catch (error) {
      console.error('Error fetching from Google Drive:', error);
      return sampleArticles;
    }
  }
  
  // ============================================
  // UI FUNCTIONS
  // ============================================
  
  function createArticleCard(article) {
    const dateObj = new Date(article.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const thumbnailHtml = article.thumbnail 
      ? `<img src="${article.thumbnail}" alt="${article.title}" style="width:100%;height:100%;object-fit:cover;">`
      : `<div class="article-preview-placeholder">
           <i data-lucide="file-text"></i>
           <span>PDF Preview</span>
         </div>`;
    
    return `
      <article class="article-card" data-id="${article.id}" data-year="${article.year}">
        <div class="article-preview">
          ${thumbnailHtml}
        </div>
        <div class="article-body">
          <div class="article-meta">
            <span class="article-year">${article.year}</span>
            <span class="article-date">${formattedDate}</span>
          </div>
          <h3 class="article-title">${article.title}</h3>
          <p class="article-author">${article.author}</p>
          <p class="article-abstract">${article.abstract}</p>
          <div class="article-footer">
            <a href="${article.pdfUrl}" target="_blank" class="download-btn" download>
              <i data-lucide="download"></i>
              Download
            </a>
          </div>
        </div>
      </article>
    `;
  }
  
  function renderArticles(articles) {
    const grid = document.getElementById('articles-grid');
    if (!grid) return;
    
    if (articles.length === 0) {
      grid.innerHTML = `
        <div class="no-results" style="grid-column:1/-1;text-align:center;padding:3rem;">
          <i data-lucide="search-x" style="width:3rem;height:3rem;color:var(--text-lighter);margin-bottom:1rem;"></i>
          <p style="color:var(--text-light);font-size:1.1rem;">No articles found matching your criteria.</p>
        </div>
      `;
    } else {
      grid.innerHTML = articles.map(createArticleCard).join('');
    }
    
    // Reinitialize Lucide icons for new elements
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }
  
  function filterArticles() {
    const searchTerm = document.getElementById('article-search')?.value.toLowerCase() || '';
    const yearFilter = document.getElementById('year-filter')?.value || '';
    
    displayedArticles = allArticles.filter(article => {
      const matchesSearch = 
        article.title.toLowerCase().includes(searchTerm) ||
        article.author.toLowerCase().includes(searchTerm) ||
        article.abstract.toLowerCase().includes(searchTerm);
      
      const matchesYear = !yearFilter || article.year === yearFilter;
      
      return matchesSearch && matchesYear;
    });
    
    renderArticles(displayedArticles);
  }
  
  function populateYearFilter() {
    const select = document.getElementById('year-filter');
    if (!select) return;
    
    const years = [...new Set(allArticles.map(a => a.year))].sort().reverse();
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">All Years</option>';
    years.forEach(year => {
      select.innerHTML += `<option value="${year}">${year}</option>`;
    });
    
    if (years.includes(currentValue)) {
      select.value = currentValue;
    }
  }
  
  async function initArchive() {
    const grid = document.getElementById('articles-grid');
    if (!grid) return;
    
    // Show loading state
    grid.innerHTML = `
      <div class="loading-state" style="grid-column:1/-1;text-align:center;padding:3rem;">
        <i data-lucide="loader-2" style="width:2.5rem;height:2.5rem;color:var(--blue);animation:spin 1s linear infinite;"></i>
        <p style="color:var(--text-light);margin-top:1rem;">Loading articles...</p>
        <style>@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}</style>
      </div>
    `;
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
    
    // Fetch articles
    if (USE_GOOGLE_DRIVE_API) {
      allArticles = await fetchFromGoogleDrive();
    } else {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));
      allArticles = sampleArticles;
    }
    
    displayedArticles = [...allArticles];
    populateYearFilter();
    renderArticles(displayedArticles);
    
    // Add event listeners
    const searchInput = document.getElementById('article-search');
    const yearSelect = document.getElementById('year-filter');
    
    if (searchInput) {
      searchInput.addEventListener('input', filterArticles);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', filterArticles);
    }
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initArchive);
  } else {
    initArchive();
  }
})();
