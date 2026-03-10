/* --- Navbar scroll effect --- */
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 10);
});

/* --- Showcase state --- */
let currentDataset = 'top10';
let currentLang = 'en';
const dataCache = {};

function getDataUrl() {
  if (currentDataset === 'top10') return `/data/hard-top10-${currentLang}.json`;
  return `/data/hard-top30-rag-${currentLang}.json`;
}

function getCacheKey() { return `${currentDataset}-${currentLang}`; }

async function loadShowcase() {
  const container = document.getElementById('showcase-cards');
  container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading questions...</div>';
  const key = getCacheKey();
  if (!dataCache[key]) {
    try {
      const res = await fetch(getDataUrl());
      dataCache[key] = await res.json();
    } catch (e) {
      container.innerHTML = '<div class="loading">Failed to load data. Ensure the server is running.</div>';
      return;
    }
  }
  renderCards(dataCache[key]);
}

function escHtml(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}

function truncate(s, n = 300) {
  if (!s) return '';
  return s.length > n ? s.substring(0, n) + '…' : s;
}

function renderCards(items) {
  const container = document.getElementById('showcase-cards');
  if (!items || !items.length) {
    container.innerHTML = '<div class="loading">No data available for this selection.</div>';
    return;
  }
  container.innerHTML = items.map((item, i) => {
    const isRag = currentDataset === 'rag30';
    return `<div class="q-card" data-idx="${i}">
      <div class="q-header" onclick="toggleCard(this)">
        <div class="q-meta">
          <div class="q-num">${i + 1}</div>
          <div class="q-title">${escHtml(truncate(item.question, 120))}</div>
        </div>
        <div class="q-badges">
          ${isRag
            ? `<span class="q-badge rag">RAG Lift: ${item.ragLiftCount} models</span>`
            : `<span class="q-badge error">Errors: ${item.errorCount}/${item.modelCount}</span>`
          }
          <span class="q-badge answer">Answer: ${escHtml(item.answer)}</span>
          <i class="fas fa-chevron-down q-expand"></i>
        </div>
      </div>
      <div class="q-body">
        <div class="q-question">${escHtml(item.question)}</div>
        <div class="q-options">
          ${renderOptions(item.options, item.answer)}
        </div>
        <div class="q-answer-row">✓ Correct Answer: ${escHtml(item.answer)}</div>
        ${item.analysis ? `<div class="q-section-title">Benchmark Analysis</div><div class="q-analysis">${escHtml(item.analysis)}</div>` : ''}
        ${isRag && item.rag ? `<div class="q-section-title">RAG Evidence</div><div class="q-rag">${escHtml(item.rag)}</div>` : ''}
        <div class="q-section-title">Model Outputs (${item.models?.length || 0} models)</div>
        <div class="model-table-wrap">
          ${isRag ? renderRagTable(item.models) : renderTop10Table(item.models)}
        </div>
      </div>
    </div>`;
  }).join('');
}

function renderOptions(opts, answer) {
  if (!opts) return '';
  return Object.entries(opts).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => {
    const isCorrect = k.toUpperCase() === (answer || '').toUpperCase();
    return `<div class="q-opt ${isCorrect ? 'correct-opt' : ''}">
      <span class="q-opt-label">${escHtml(k)}.</span>
      <span>${escHtml(v)}</span>
    </div>`;
  }).join('');
}

function renderTop10Table(models) {
  if (!models || !models.length) return '<p>No model data.</p>';
  const rows = models.map(m => {
    const cls = m.correct ? 'correct-cell' : 'wrong-cell';
    const sym = m.correct ? '✓' : '✗';
    return `<tr>
      <td>${escHtml(m.name)}</td>
      <td>${escHtml(m.choice)}</td>
      <td class="${cls}">${sym}</td>
      <td><div class="model-reasoning">${escHtml(m.reasoning)}</div></td>
    </tr>`;
  }).join('');
  return `<table class="model-table">
    <thead><tr><th>Model</th><th>Choice</th><th>Correct</th><th>Reasoning</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function renderRagTable(models) {
  if (!models || !models.length) return '<p>No model data.</p>';
  const rows = models.map(m => {
    const dcCls = m.directCorrect ? 'correct-cell' : 'wrong-cell';
    const rcCls = m.ragCorrect ? 'correct-cell' : 'wrong-cell';
    return `<tr>
      <td>${escHtml(m.name)}</td>
      <td class="${dcCls}">${m.directCorrect ? '✓' : '✗'}</td>
      <td>${escHtml(m.directChoice)}</td>
      <td class="${rcCls}">${m.ragCorrect ? '✓' : '✗'}</td>
      <td>${escHtml(m.ragChoice)}</td>
      <td><div class="model-reasoning">${escHtml(truncate(m.directReasoning, 300))}</div></td>
      <td><div class="model-reasoning">${escHtml(truncate(m.ragReasoning, 300))}</div></td>
    </tr>`;
  }).join('');
  return `<table class="model-table">
    <thead><tr><th>Model</th><th>Direct</th><th>D.Choice</th><th>RAG</th><th>R.Choice</th><th>Direct Reasoning</th><th>RAG Reasoning</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function toggleCard(header) {
  header.parentElement.classList.toggle('open');
}

/* --- Tab/Lang switching --- */
document.querySelectorAll('#showcase-dataset-tabs .tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#showcase-dataset-tabs .tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentDataset = btn.dataset.dataset;
    loadShowcase();
  });
});

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentLang = btn.dataset.lang;
    loadShowcase();
  });
});

/* --- Initial load --- */
document.addEventListener('DOMContentLoaded', loadShowcase);
