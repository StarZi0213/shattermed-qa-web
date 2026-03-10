const fs = require('fs');
const path = require('path');

const RESULTS_DIR = path.join(__dirname, '..', '..', 'Results-Majority');
const OUTPUT_DIR = path.join(__dirname, 'public', 'data');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function loadJsonl(filename) {
  const filepath = path.join(RESULTS_DIR, filename);
  if (!fs.existsSync(filepath)) {
    console.warn(`Warning: ${filepath} not found, skipping.`);
    return [];
  }
  const content = fs.readFileSync(filepath, 'utf-8');
  return content.split('\n').filter(line => line.trim()).map(line => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
}

function summarizeQuestion(item, type) {
  const base = {
    id: item.id,
    question: item['题目'] || item.question || '',
    options: item['选项'] || item.options || {},
    answer: item['答案'] || item.answer || '',
    language: item['语言'] || item.language || '',
    source: item['来源'] || item.source || '',
  };

  if (type === 'top10') {
    base.errorCount = item['错误次数'] || 0;
    base.modelCount = item['模型数'] || 0;
    base.analysis = item['原文分析'] || '';
    base.analysisA = item['原文分析A'] || '';
    base.analysisB = item['原文分析B'] || '';
    base.rationale = item['rationale'] || '';
    base.models = (item['各模型输出'] || []).map(m => ({
      name: m['模型或运行'] || m.model || '',
      reasoning: (m['推理'] || '').substring(0, 800),
      choice: m['选择'] || m.choice || '',
      correct: m['正确'] || false,
    }));
  } else if (type === 'rag_lift') {
    base.ragLiftCount = item['RAG救回模型数'] || 0;
    base.rag = (item['采用的RAG'] || '').substring(0, 1500);
    base.analysis = item['原文分析'] || '';
    base.models = (item['各模型输出'] || []).map(m => ({
      name: m['模型或运行'] || '',
      directCorrect: m['无RAG正确'] || false,
      ragCorrect: m['有RAG正确'] || false,
      directChoice: m['无RAG选择'] || '',
      ragChoice: m['有RAG选择'] || '',
      directReasoning: (m['无RAG推理'] || '').substring(0, 500),
      ragReasoning: (m['有RAG推理'] || '').substring(0, 500),
    }));
  }
  return base;
}

const FILES = [
  { input: 'hard_top10_zh.jsonl', output: 'hard-top10-zh.json', type: 'top10' },
  { input: 'hard_top10_en.jsonl', output: 'hard-top10-en.json', type: 'top10' },
  { input: 'hard_top30_rag_lift_zh.jsonl', output: 'hard-top30-rag-zh.json', type: 'rag_lift' },
  { input: 'hard_top30_rag_lift_en.jsonl', output: 'hard-top30-rag-en.json', type: 'rag_lift' },
];

console.log('Building static data files...');
for (const { input, output, type } of FILES) {
  const raw = loadJsonl(input);
  const processed = raw.map(item => summarizeQuestion(item, type));
  const outPath = path.join(OUTPUT_DIR, output);
  fs.writeFileSync(outPath, JSON.stringify(processed, null, 0));
  console.log(`  ${input} → ${output} (${processed.length} items, ${(fs.statSync(outPath).size / 1024).toFixed(1)}KB)`);
}

console.log('Build complete!');
