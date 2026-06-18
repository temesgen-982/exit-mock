import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'src', 'lib', 'data');

function resolveAnswer(letter, options) {
  if (!letter) return '';
  const match = options.find(o => o.trim().toUpperCase().startsWith(letter.toUpperCase() + '.'));
  return match || '';
}

function parsePhase1(text) {
  const lines = text.split('\n');
  const sections = { 'General': [] };
  let cur = null;

  function flush() {
    if (!cur) return;
    if (!cur.options.length) return;
    cur.answer = resolveAnswer(cur.answerLetter, cur.options);
    delete cur.answerLetter;
    sections['General'].push(cur);
    cur = null;
  }

  const upperOptRegex = /([A-TV-Z])\s*\.\s+/g;
  const lowerOptRegex = /([a-d])[\.\)]\s+/g;

  function parseOptions(line) {
    const opts = [];
    function scan(regex) {
      let lastLetter = '';
      let lastIdx = 0;
      let m;
      while ((m = regex.exec(line)) !== null) {
        if (m.index !== 0 && line[m.index - 1] !== ' ') continue;
        if (lastLetter) {
          const text = line.slice(lastIdx, m.index).trim();
          if (text) opts.push(`${lastLetter.toUpperCase()}. ${text}`);
        }
        lastLetter = m[1];
        lastIdx = m.index + m[0].length;
      }
      if (lastLetter && lastIdx < line.length) {
        const text = line.slice(lastIdx).trim();
        if (text) opts.push(`${lastLetter.toUpperCase()}. ${text}`);
      }
    }
    scan(lowerOptRegex);
    scan(upperOptRegex);
    const seen = new Set();
    return opts.filter(o => {
      const letter = o[0];
      if (seen.has(letter)) return false;
      seen.add(letter);
      return true;
    });
  }

  for (let i = 0; i < lines.length; i++) {
    let t = lines[i].trim();
    t = t.replace(/\f/g, '').trim();
    if (!t) continue;

    if (/^(School|Department|Model Exam|ID No|Part I)/i.test(t)) continue;

    const qm = t.match(/^(\d+)\s*[\.\)]\s+(.*)/);
    if (qm) {
      flush();
      cur = { id: qm[1], question: qm[2], options: [], answerLetter: '' };
      continue;
    }

    if (!cur) continue;

    const parsedOpts = parseOptions(t);
    if (parsedOpts.length > 0) {
      for (const opt of parsedOpts) cur.options.push(opt);
      continue;
    }

    cur.question += ' ' + t;
  }
  flush();
  return sections;
}

const configs = [
  { input: 'model-exam-phase1.txt', parser: parsePhase1, output: 'model-exam-phase1.json' },
];

for (const { input, parser, output } of configs) {
  const text = readFileSync(join(dataDir, input), 'utf-8');
  const result = parser(text);
  const total = Object.values(result).reduce((s, qs) => s + qs.length, 0);
  const answered = Object.values(result).reduce((s, qs) => s + qs.filter(q => q.answer).length, 0);
  writeFileSync(join(dataDir, output), JSON.stringify(result, null, 2) + '\n');
  console.log(`${input} → ${output}: ${Object.keys(result).length} section(s), ${total} questions (${answered} with answers)`);
}
