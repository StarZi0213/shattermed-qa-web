const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const RESULTS_DIR = path.join(__dirname, '..', '..', 'Results-Majority');

app.use(express.static(path.join(__dirname, 'public')));

function loadJsonl(filename) {
  const filepath = path.join(RESULTS_DIR, filename);
  if (!fs.existsSync(filepath)) return [];
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

const dataCache = {};
function getData(filename, type) {
  if (!dataCache[filename]) {
    const raw = loadJsonl(filename);
    dataCache[filename] = raw.map(item => summarizeQuestion(item, type));
  }
  return dataCache[filename];
}

app.get('/api/hard-top10-zh', (req, res) => {
  res.json(getData('hard_top10_zh.jsonl', 'top10'));
});
app.get('/api/hard-top10-en', (req, res) => {
  res.json(getData('hard_top10_en.jsonl', 'top10'));
});
app.get('/api/hard-top30-rag-zh', (req, res) => {
  res.json(getData('hard_top30_rag_lift_zh.jsonl', 'rag_lift'));
});
app.get('/api/hard-top30-rag-en', (req, res) => {
  res.json(getData('hard_top30_rag_lift_en.jsonl', 'rag_lift'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`ShatterMed-QA project page running at http://localhost:${PORT}`);
});
