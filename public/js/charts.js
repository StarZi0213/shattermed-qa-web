const PLOTLY_CFG = { responsive: true, displayModeBar: false };
const PLOTLY_LAYOUT_BASE = {
  font: { family: 'Inter, -apple-system, sans-serif', color: '#1e293b' },
  paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
  margin: { l: 50, r: 30, t: 40, b: 50 },
};

function initCharts() {
  renderTaskPie();
  renderTaskBar();
  renderQualityRadar();
  renderBenchmarkComparison();
  renderAccuracyChart();
  renderDropChart();
  renderRagScatter();
  renderRagBar();
  renderShatteringDemo();
}

/* ============ TASK DISTRIBUTION PIE ============ */
function renderTaskPie() {
  const data = [{
    values: [8219, 1573, 433, 211, 122],
    labels: ['Clinical Diagnosis', 'Clinical Treatment', 'Pharmacy/Drug Safety', 'Basic Medicine', 'Prevention/Epidemiology'],
    type: 'pie', hole: 0.45,
    marker: { colors: ['#2563eb', '#7c3aed', '#f59e0b', '#10b981', '#ef4444'] },
    textinfo: 'label+percent', textposition: 'outside',
    hoverinfo: 'label+value+percent',
    pull: [0.03, 0, 0, 0, 0],
  }];
  Plotly.newPlot('chart-task-pie', data, {
    ...PLOTLY_LAYOUT_BASE,
    title: { text: 'Overall (N=10,558)', font: { size: 14 } },
    showlegend: false,
    margin: { l: 20, r: 20, t: 50, b: 20 },
  }, PLOTLY_CFG);
}

/* ============ TASK DISTRIBUTION BAR ============ */
function renderTaskBar() {
  const cats = ['Clinical Diagnosis', 'Clinical Treatment', 'Pharmacy/Drug', 'Basic Medicine', 'Prevention/Epi.'];
  const zhEasy = [71.7, 19.0, 4.3, 3.0, 2.0];
  const enEasy = [80.4, 13.3, 3.6, 1.6, 1.1];
  const zhHard = [74.3, 17.5, 4.5, 2.3, 1.4];
  const enHard = [78.9, 14.5, 4.0, 1.7, 0.9];
  const colors = ['#93c5fd', '#2563eb', '#a78bfa', '#7c3aed'];
  const data = [
    { name: 'ZH Easy', x: cats, y: zhEasy, type: 'bar', marker: { color: colors[0] } },
    { name: 'EN Easy', x: cats, y: enEasy, type: 'bar', marker: { color: colors[1] } },
    { name: 'ZH Hard', x: cats, y: zhHard, type: 'bar', marker: { color: colors[2] } },
    { name: 'EN Hard', x: cats, y: enHard, type: 'bar', marker: { color: colors[3] } },
  ];
  Plotly.newPlot('chart-task-bar', data, {
    ...PLOTLY_LAYOUT_BASE,
    barmode: 'group',
    yaxis: { title: 'Percentage (%)', gridcolor: '#e2e8f0' },
    xaxis: { tickangle: -15 },
    legend: { orientation: 'h', y: 1.12 },
  }, PLOTLY_CFG);
}

/* ============ QUALITY RADAR (all 9 datasets) ============ */
function renderQualityRadar() {
  const cats = ['Clarity', 'Validity', 'Difficulty', 'Distractor Sim.', 'Low Overlap A', 'Low Overlap B'];
  const norm = (v, max) => (v / max) * 5;
  const na = 2.5; // placeholder for dimensions not reported in other benchmarks
  const datasets = [
    { name: 'MedQA', clarity: 3.92, validity: 3.87, difficulty: 2.96, color: '#94a3b8' },
    { name: 'MMedBench', clarity: 4.03, validity: 4.04, difficulty: 2.79, color: '#64748b' },
    { name: 'MultiMedQA', clarity: 3.93, validity: 3.94, difficulty: 2.64, color: '#475569' },
    { name: 'AfriMedQA', clarity: 3.80, validity: 3.72, difficulty: 2.83, color: '#f59e0b' },
    { name: 'PubMedQA', clarity: 2.92, validity: 2.43, difficulty: 2.46, color: '#f97316' },
    { name: 'CRAFT-MedQA', clarity: 3.71, validity: 3.52, difficulty: 2.55, color: '#ef4444' },
    { name: 'MedReason', clarity: 3.79, validity: 3.81, difficulty: 3.04, color: '#ec4899' },
    { name: 'MedQA-Evol', clarity: 4.17, validity: 4.32, difficulty: 2.94, color: '#8b5cf6' },
    { name: 'ShatterMed-QA', clarity: 4.70, validity: 4.87, difficulty: 3.11, color: '#2563eb' },
  ];
  const data = datasets.map((d, i) => {
    const isOurs = d.name === 'ShatterMed-QA';
    const r = isOurs
      ? [d.clarity, d.validity, d.difficulty, norm(0.598, 1), norm(1 - 0.093, 1), norm(1 - 0.100, 1)]
      : [d.clarity, d.validity, d.difficulty, na, na, na];
    const rClosed = [...r, r[0]];
    const thetaClosed = [...cats, cats[0]];
    return {
      type: 'scatterpolar',
      r: rClosed,
      theta: thetaClosed,
      fill: 'toself',
      name: d.name,
      line: { color: d.color, width: isOurs ? 2.5 : 1.2 },
      fillcolor: isOurs ? 'rgba(37,99,235,.25)' : 'rgba(128,128,128,.07)',
    };
  });
  Plotly.newPlot('chart-quality', data, {
    ...PLOTLY_LAYOUT_BASE,
    polar: {
      radialaxis: { visible: true, range: [0, 5], gridcolor: '#e2e8f0', tickfont: { size: 11 } },
      angularaxis: { tickfont: { size: 11 }, rotation: 90 },
    },
    legend: { orientation: 'h', y: -0.35, x: 0.5, xanchor: 'middle', font: { size: 10 } },
    margin: { l: 100, r: 100, t: 50, b: 120 },
    height: 460,
  }, PLOTLY_CFG);
}

/* ============ BENCHMARK COMPARISON ============ */
function renderBenchmarkComparison() {
  const datasets = ['MedQA', 'MMedBench', 'MultiMedQA', 'AfriMedQA', 'PubMedQA', 'CRAFT-MedQA', 'MedReason', 'MedQA-Evol', 'ShatterMed-QA'];
  const traceability = [
    'Chapter-level',
    'Chapter-level',
    'Chapter-level',
    'Chapter-level',
    'Abstract-level',
    'LLM Rationale',
    'Graph-level',
    'LLM Rationale',
    'Exact (Sentence & Page Summary)',
  ];
  const sizes = [6110, 8518, 1242, 3723, 1000, 5000, 25484, 51809, 10558];
  const clarity = [3.92, 4.03, 3.93, 3.80, 2.92, 3.71, 3.79, 4.17, 4.70];
  const validity = [3.87, 4.04, 3.94, 3.72, 2.43, 3.52, 3.81, 4.32, 4.87];
  const difficulty = [2.96, 2.79, 2.64, 2.83, 2.46, 2.55, 3.04, 2.94, 3.11];

  const makeTrace = (name, values, color) => ({
    name,
    x: datasets,
    y: values,
    type: 'bar',
    marker: { color },
    hovertemplate:
      '<b>%{x}</b><br>' +
      name + ': %{y:.2f}<br>' +
      'Traceability: %{customdata[0]}<br>' +
      'Size N: %{customdata[1]}<extra></extra>',
    customdata: traceability.map((t, i) => [t, sizes[i].toLocaleString()]),
  });

  const data = [
    makeTrace('Clarity', clarity, '#60a5fa'),
    makeTrace('Validity', validity, '#34d399'),
    makeTrace('Difficulty', difficulty, '#f87171'),
  ];

  Plotly.newPlot('chart-benchmark', data, {
    ...PLOTLY_LAYOUT_BASE,
    barmode: 'group',
    yaxis: { title: 'Score (1-5)', range: [0, 5.2], gridcolor: '#e2e8f0' },
    xaxis: { tickangle: -25 },
    legend: { orientation: 'h', y: 1.1 },
    annotations: [
      {
        x: 'ShatterMed-QA',
        y: 5.1,
        text: '★ Ours (Exact evidence, N=10,558)',
        showarrow: false,
        font: { color: '#2563eb', size: 12, weight: 'bold' },
      },
    ],
  }, PLOTLY_CFG);
}

/* ============ MODEL ACCURACY ============ */
function renderAccuracyChart() {
  const models = [
    'GPT-4.1-mini', 'GPT-5-mini', 'GPT-5-nano', 'GPT-4.1-nano',
    'Grok-4.1-fast-R', 'Grok-4.1-fast-NR', 'Grok-4-fast-R', 'Grok-4-fast-NR',
    'Qwen3-14B', 'Falcon3-10B', 'Yi-1.5-9B', 'Gemma-2-9b',
    'Llama-3.1-8B', 'InternLM3-8B', 'Command-R-7B', 'Granite-3.3-8b',
    'Med42-8B', 'MedGemma-4B', 'Meditron-7B', 'OpenBioLLM-8B', 'BioMistral-7B'
  ];
  const enEasy = [98.31, 97.45, 91.59, 96.25, 98.08, 74.35, 98.18, 96.96, 90.04, 85.80, 79.23, 77.17, 79.40, 80.20, 77.70, 68.12, 82.64, 81.85, 80.60, 73.37, 60.59];
  const enHard = [97.28, 96.81, 89.83, 93.85, 97.58, 96.10, 97.87, 96.04, 86.47, 83.70, 69.17, 55.82, 72.30, 78.44, 71.59, 65.27, 80.45, 76.26, 64.74, 63.14, 54.64];
  const zhHard = [96.94, 96.33, 86.54, 84.71, 96.64, 96.33, 96.64, 96.02, 92.35, 63.61, 80.73, 79.51, 67.89, 89.30, 74.31, 70.95, 78.90, 74.62, 73.09, 55.05, 44.04];

  const data = [
    { name: 'EN Easy', x: models, y: enEasy, type: 'bar', marker: { color: '#93c5fd' } },
    { name: 'EN Hard', x: models, y: enHard, type: 'bar', marker: { color: '#2563eb' } },
    { name: 'ZH Hard', x: models, y: zhHard, type: 'bar', marker: { color: '#7c3aed' } },
  ];
  const shapes = [
    { type: 'line', x0: 7.5, x1: 7.5, y0: 0, y1: 100, line: { color: '#cbd5e1', width: 1, dash: 'dash' } },
    { type: 'line', x0: 15.5, x1: 15.5, y0: 0, y1: 100, line: { color: '#cbd5e1', width: 1, dash: 'dash' } },
  ];
  const annotations = [
    { x: 3.5, y: 102, text: 'Proprietary', showarrow: false, font: { size: 11, color: '#64748b' } },
    { x: 11.5, y: 102, text: 'Open-Weights', showarrow: false, font: { size: 11, color: '#64748b' } },
    { x: 18.5, y: 102, text: 'Medical', showarrow: false, font: { size: 11, color: '#64748b' } },
  ];
  Plotly.newPlot('chart-accuracy', data, {
    ...PLOTLY_LAYOUT_BASE,
    barmode: 'group',
    yaxis: { title: 'Accuracy (%)', range: [30, 105], gridcolor: '#e2e8f0' },
    xaxis: { tickangle: -40 },
    legend: { orientation: 'h', y: 1.08 },
    shapes, annotations,
    margin: { l: 50, r: 30, t: 60, b: 120 },
  }, PLOTLY_CFG);
}

/* ============ EASY→HARD DROP ============ */
function renderDropChart() {
  const models = ['Gemma-2-9b', 'Meditron-7B', 'BioMistral-7B', 'OpenBioLLM-8B', 'Yi-1.5-9B', 'Falcon3-10B', 'MedGemma-4B', 'Llama-3.1-8B', 'Command-R-7B', 'Qwen3-14B'];
  const drop = [21.35, 15.86, 5.95, 10.23, 10.06, 2.10, 5.59, 7.10, 6.11, 3.57];
  const data = [{
    x: drop, y: models, type: 'bar', orientation: 'h',
    marker: { color: drop.map(d => d > 10 ? '#ef4444' : d > 5 ? '#f59e0b' : '#10b981') },
    text: drop.map(d => d.toFixed(1) + '%'), textposition: 'outside',
  }];
  Plotly.newPlot('chart-drop', data, {
    ...PLOTLY_LAYOUT_BASE,
    xaxis: { title: 'Accuracy Drop (%)', gridcolor: '#e2e8f0' },
    yaxis: { autorange: 'reversed' },
    margin: { l: 130, r: 60, t: 20, b: 50 },
    showlegend: false,
  }, PLOTLY_CFG);
}

/* ============ RAG SCATTER ============ */
function renderRagScatter() {
  const models = ['GPT-5-mini', 'GPT-5-nano', 'GPT-4.1-mini', 'GPT-4.1-nano', 'Grok-4.1-R', 'Grok-4.1-NR', 'Grok-4-R', 'Grok-4-NR', 'Qwen3-14B', 'Falcon3-10B', 'Yi-1.5-9B', 'Gemma-2-9b', 'Llama-3.1-8B', 'InternLM3-8B', 'Command-R7B', 'Granite-3.3', 'Med42-8B', 'MedGemma-4B', 'Meditron-7B', 'OpenBioLLM-8B', 'BioMistral-7B'];
  const direct = [96.57, 88.19, 97.11, 89.28, 97.11, 96.22, 97.26, 96.03, 89.41, 73.66, 74.95, 67.67, 70.10, 83.87, 72.95, 68.11, 79.68, 75.44, 68.92, 59.10, 49.34];
  const rag =    [97.50, 91.50, 98.00, 92.50, 98.00, 97.50, 98.20, 97.00, 93.00, 82.00, 83.00, 81.67, 78.50, 87.50, 79.00, 66.00, 85.00, 83.00, 77.50, 72.00, 75.14];
  const cats = models.map((m, i) => i < 8 ? 'Proprietary' : i < 16 ? 'Open-Weights' : 'Medical');
  const catColors = { 'Proprietary': '#2563eb', 'Open-Weights': '#f59e0b', 'Medical': '#ef4444' };
  const traces = ['Proprietary', 'Open-Weights', 'Medical'].map(cat => ({
    x: direct.filter((_, i) => cats[i] === cat),
    y: rag.filter((_, i) => cats[i] === cat),
    text: models.filter((_, i) => cats[i] === cat),
    mode: 'markers+text', textposition: 'top center', textfont: { size: 8 },
    type: 'scatter', name: cat,
    marker: { color: catColors[cat], size: 10 },
  }));
  traces.push({
    x: [30, 100], y: [30, 100], mode: 'lines', name: 'y=x (parity)',
    line: { color: '#cbd5e1', dash: 'dash', width: 1 }, showlegend: false,
  });
  Plotly.newPlot('chart-rag-scatter', traces, {
    ...PLOTLY_LAYOUT_BASE,
    xaxis: { title: 'Direct Accuracy (%)', range: [40, 100], gridcolor: '#e2e8f0' },
    yaxis: { title: 'RAG Accuracy (%)', range: [60, 100], gridcolor: '#e2e8f0' },
    legend: { orientation: 'h', y: 1.1 },
    margin: { l: 55, r: 30, t: 40, b: 55 },
  }, PLOTLY_CFG);
}

/* ============ RAG BAR ============ */
function renderRagBar() {
  const models = ['BioMistral', 'Gemma-2', 'OpenBioLLM', 'MedGemma', 'Meditron', 'Yi-1.5', 'Falcon3', 'Llama-3.1', 'Command-R7B', 'Med42', 'Qwen3-14B', 'InternLM3', 'GPT-5-nano', 'GPT-4.1-nano', 'Grok-4-NR', 'Grok-4.1-NR', 'GPT-5-mini', 'GPT-4.1-mini', 'Grok-4-R', 'Grok-4.1-R'];
  const improvement = [25.80, 14.00, 12.90, 7.56, 8.58, 8.05, 8.34, 8.40, 6.05, 5.32, 3.59, 3.63, 3.31, 3.22, 0.97, 1.28, 0.93, 0.89, 0.94, 0.89];
  const data = [{
    x: models, y: improvement, type: 'bar',
    marker: { color: improvement.map(v => v > 10 ? '#2563eb' : v > 5 ? '#60a5fa' : '#93c5fd') },
    text: improvement.map(v => '+' + v.toFixed(1) + '%'), textposition: 'outside',
  }];
  Plotly.newPlot('chart-rag-bar', data, {
    ...PLOTLY_LAYOUT_BASE,
    yaxis: { title: 'Absolute Improvement (%)', gridcolor: '#e2e8f0' },
    xaxis: { tickangle: -40 },
    showlegend: false,
    margin: { l: 50, r: 30, t: 30, b: 120 },
  }, PLOTLY_CFG);
}

/* ============ SHATTERING DEMO ============ */
function renderShatteringDemo() {
  const nodes = ['Diabetes', 'Blood', 'Fracture', 'AGEs', 'Osteoblast↓', 'BMD↓'];
  const xOrig = [0, 2, 4, 1, 2, 3];
  const yOrig = [2, 2, 2, 0.5, 0.5, 0.5];
  const shortcutEdges = { x: [0, 2, null, 2, 4, null], y: [2, 2, null, 2, 2, null] };
  const deepEdges = { x: [0, 1, null, 1, 2, null, 2, 3, null, 3, 4, null], y: [2, 0.5, null, 0.5, 0.5, null, 0.5, 0.5, null, 0.5, 2, null] };

  const data = [
    { x: shortcutEdges.x, y: shortcutEdges.y, mode: 'lines', line: { color: '#ef4444', width: 3, dash: 'dash' }, name: 'Shortcut (pruned)', showlegend: true },
    { x: deepEdges.x, y: deepEdges.y, mode: 'lines', line: { color: '#10b981', width: 3 }, name: 'Deep Cascade (enforced)', showlegend: true },
    {
      x: xOrig, y: yOrig, mode: 'markers+text', type: 'scatter',
      text: nodes, textposition: ['middle left', 'top center', 'middle right', 'bottom center', 'bottom center', 'bottom center'],
      textfont: { size: 11 },
      marker: {
        size: [20, 25, 20, 16, 16, 16],
        color: ['#2563eb', '#ef4444', '#2563eb', '#10b981', '#10b981', '#10b981'],
        line: { width: 2, color: '#fff' },
      },
      name: 'Nodes', showlegend: false,
    },
  ];
  Plotly.newPlot('chart-shattering', data, {
    ...PLOTLY_LAYOUT_BASE,
    xaxis: { visible: false, range: [-0.5, 4.5] },
    yaxis: { visible: false, range: [-0.3, 3] },
    legend: { orientation: 'h', y: -0.05 },
    margin: { l: 10, r: 10, t: 10, b: 40 },
    annotations: [
      { x: 2, y: 2.5, text: '✗ Hub "Blood" (pruned)', font: { color: '#ef4444', size: 11 }, showarrow: false },
      { x: 2, y: -0.15, text: 'd_shattered ≥ d_original', font: { color: '#10b981', size: 12, weight: 'bold' }, showarrow: false },
    ],
  }, PLOTLY_CFG);
}

document.addEventListener('DOMContentLoaded', initCharts);
