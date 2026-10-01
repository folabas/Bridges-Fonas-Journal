const API = 'https://bridges-journal.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
  const grid      = document.getElementById('articles-grid');
  const pagWrap   = document.getElementById('archive-pagination');
  const searchEl  = document.getElementById('article-search');
  const yearEl    = document.getElementById('year-filter');
  const catEl     = document.getElementById('cat-filter');

  if (!grid) return;

  const isMobile   = window.innerWidth <= 768;
  const LIMIT      = isMobile ? 3 : 6;
  let page         = 1;
  let search       = '';
  let year         = '';
  let category     = '';
  
  // Set layout
  if (!isMobile) {
    Object.assign(grid.style, {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '24px',
    });
  }

  // ── Skeletons ──────────────────────────────────────────────────────────────
  function showSkeletons() {
    grid.innerHTML = Array.from({ length: 6 }).map(() => `
      <div class="article-card-skeleton">
        <div class="sk-thumb"></div>
        <div class="sk-body">
          <div class="sk-line sk-title"></div>
          <div class="sk-line sk-short"></div>
          <div class="sk-line sk-xshort"></div>
        </div>
      </div>
    `).join('');
  }

  // ── Fetch ──────────────────────────────────────────────────────────────────
  async function load() {
    showSkeletons();
    try {
      let url = `${API}/api/articles?page=${page}&limit=${LIMIT}`;
      if (search)   url += `&search=${encodeURIComponent(search)}`;
      if (year)     url += `&year=${year}`;
      if (category) url += `&category=${encodeURIComponent(category)}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('bad response');
      const data = await res.json();
      renderCards(data.articles);
      renderPagination(data.page, data.pages);
    } catch {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <i class="fa-solid fa-server" style="font-size:56px;color:var(--danger);margin-bottom:20px;"></i>
          <h3>Server Connection Error</h3>
          <p>Unable to reach the database. Please try again later.</p>
        </div>`;
    }
  }

  // ── Cards ──────────────────────────────────────────────────────────────────
  function renderCards(articles) {
    if (!articles || !articles.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <i class="fa-solid fa-folder-open" style="font-size:56px;color:var(--text-muted);margin-bottom:20px;"></i>
          <h3>No Articles Found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>`;
      return;
    }

    grid.innerHTML = '';
    articles.forEach((a, i) => {
      const card = document.createElement('article');
      card.className = 'ac-card scroll-stack-card';
      
      if (isMobile) {
        card.style.setProperty('--mobile-top', `calc(7rem + ${i * 1.5}rem)`);
        card.style.setProperty('--mobile-z', 10 + i);
        card.style.setProperty('--mobile-mt', i === 0 ? '0' : '2.5rem');
      }

      card.innerHTML = `
        <div class="ac-thumb" style="${a.thumbnailUrl ? `background-image:url('${a.thumbnailUrl}')` : ''}">
          ${!a.thumbnailUrl ? '<i class="fa-solid fa-file-pdf ac-thumb-icon"></i>' : ''}
          <span class="ac-badge">${escHtml(a.category || 'Research')}</span>
        </div>
        <div class="ac-body">
          <div class="ac-meta">${a.year || '2026'} &middot; Vol.&nbsp;${a.volume || '1'}, Issue&nbsp;${a.issue || '1'}</div>
          <h3 class="ac-title">${escHtml(a.title)}</h3>
          <p class="ac-authors">${escHtml((a.authors || []).join(', '))}</p>
        </div>
        <div class="ac-footer">
          <button class="ac-btn-view" data-id="${a._id}">
            <i class="fa-solid fa-eye"></i> View Article
          </button>
        </div>
      `;
      card.querySelector('.ac-btn-view').addEventListener('click', () => openModal(a));
      grid.appendChild(card);
    });
  }

  // ── Pagination ─────────────────────────────────────────────────────────────
  function renderPagination(cur, total) {
    if (!pagWrap) return;
    if (total <= 1) { pagWrap.innerHTML = ''; return; }

    let html = '<div class="pagination-controls">';
    html += `<button class="page-btn" ${cur===1?'disabled':''} id="pg-prev"><i class="fa-solid fa-chevron-left"></i></button>`;

    // Page dots
    for (let i = 1; i <= total; i++) {
      html += `<button class="page-dot-btn ${i===cur?'active':''}" data-p="${i}">${i}</button>`;
    }
    html += `<button class="page-btn" ${cur===total?'disabled':''} id="pg-next"><i class="fa-solid fa-chevron-right"></i></button>`;
    html += '</div>';
    pagWrap.innerHTML = html;

    pagWrap.querySelector('#pg-prev')?.addEventListener('click', () => go(cur - 1));
    pagWrap.querySelector('#pg-next')?.addEventListener('click', () => go(cur + 1));
    pagWrap.querySelectorAll('.page-dot-btn').forEach(b =>
      b.addEventListener('click', () => go(+b.dataset.p))
    );
  }

  function go(n) {
    page = n;
    load();
    document.getElementById('archive')?.scrollIntoView({ behavior: 'smooth' });
  }

  // ── Filters ────────────────────────────────────────────────────────────────
  let debounce;
  searchEl?.addEventListener('input', e => {
    clearTimeout(debounce);
    debounce = setTimeout(() => { search = e.target.value; page = 1; load(); }, 450);
  });
  yearEl?.addEventListener('change', e => { year = e.target.value; page = 1; load(); });
  catEl?.addEventListener('change',  e => { category = e.target.value; page = 1; load(); });

  load();
});

// ── Article Modal ─────────────────────────────────────────────────────────────
function openModal(article) {
  let modal = document.getElementById('article-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'article-modal';
    modal.innerHTML = `
      <div class="am-overlay" id="am-overlay"></div>
      <div class="am-box" role="dialog" aria-modal="true">
        <button class="am-close" id="am-close"><i class="fa-solid fa-xmark"></i></button>
        <div class="am-inner">
          <div class="am-thumb-col">
            <div class="am-thumb" id="am-thumb"></div>
            <div class="am-info" id="am-info"></div>
          </div>
          <div class="am-content-col">
            <div class="am-badge-row" id="am-badges"></div>
            <h2 class="am-title" id="am-title"></h2>
            <p class="am-authors" id="am-authors"></p>
            <div class="am-divider"></div>
            <h4 class="am-section-label">Abstract</h4>
            <p class="am-abstract" id="am-abstract"></p>
            <div class="am-kw" id="am-keywords"></div>
            <div class="am-actions" id="am-actions"></div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);

    document.getElementById('am-overlay').addEventListener('click', closeModal);
    document.getElementById('am-close').addEventListener('click', closeModal);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  }

  // Populate
  const a = article;
  const thumb = document.getElementById('am-thumb');
  thumb.style.backgroundImage = a.thumbnailUrl ? `url('${a.thumbnailUrl}')` : 'none';
  thumb.innerHTML = !a.thumbnailUrl ? '<i class="fa-solid fa-file-pdf"></i>' : '';

  document.getElementById('am-info').innerHTML = `
    <div class="am-info-row"><span>Volume</span><strong>${a.volume || '1'}</strong></div>
    <div class="am-info-row"><span>Issue</span><strong>${a.issue || '1'}</strong></div>
    ${a.pages ? `<div class="am-info-row"><span>Pages</span><strong>${escHtml(a.pages)}</strong></div>` : ''}
    ${a.doi   ? `<div class="am-info-row"><span>DOI</span><a href="https://doi.org/${escHtml(a.doi)}" target="_blank">${escHtml(a.doi)}</a></div>` : ''}
    <div class="am-info-row"><span>Year</span><strong>${a.year}</strong></div>
    <div class="am-info-row downloads-row"><i class="fa-solid fa-download"></i><span id="am-dl-count">${a.downloads || 0} downloads</span></div>
  `;

  document.getElementById('am-badges').innerHTML = `
    <span class="ac-badge am-cat-badge">${escHtml(a.category || 'Research')}</span>
    <span class="am-year-badge">${a.year}</span>
  `;
  document.getElementById('am-title').textContent   = a.title;
  document.getElementById('am-authors').textContent  = (a.authors || []).join(' · ');
  document.getElementById('am-abstract').textContent = a.abstract || 'No abstract available.';

  const kwEl = document.getElementById('am-keywords');
  if (a.keywords && a.keywords.length) {
    kwEl.innerHTML = (a.keywords).map(k => `<span class="am-kw-chip">${escHtml(k)}</span>`).join('');
  } else { kwEl.innerHTML = ''; }

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
      // Trigger real download (bypasses popup blockers and handles Cloudinary attachment safely)
      window.location.href = data.pdfUrl;
      // Update counter in modal
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
}

function closeModal() {
  const modal = document.getElementById('article-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
