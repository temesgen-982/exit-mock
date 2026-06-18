import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'src', 'lib', 'data');

function resolveAnswer(text, options) {
  if (!text) return '';
  const t = text.trim().toLowerCase();
  for (const opt of options) {
    if (opt.trim().toLowerCase() === t) return opt;
  }
  return '';
}

// Known section titles in order from the PDF description
const SECTION_NAMES = [
  'Database Systems',
  'Computer Programming',
  'Data Communication and Computer Networks',
  'Information Systems Project Management',
  'Fundamentals of Artificial Intelligence',
  'Systems Analysis and Design',
  'Introduction to Information Retrieval',
  'Internet Programming',
  'Information System Security',
];

function parseMock1Pdf(text) {
  const rawLines = text.split('\n');
  const lines = [];

  // Pre-process: strip form feeds, trim, remove metadata lines
  let foundFirstSection = false;
  for (let raw of rawLines) {
    let l = raw.replace(/\f/g, '').trim();
    if (!l) { lines.push(''); continue; }

    // Skip everything before the first section header
    if (!foundFirstSection) {
      if (isSectionHeader(l)) {
        foundFirstSection = true;
        lines.push(l);
      }
      continue;
    }

    // Skip metadata/irrelevant lines
    if (/^Email \*$/i.test(l)) continue;
    if (/^[a-z]+\.[a-z]+@/i.test(l)) continue;
    if (/^This form was created/i.test(l)) continue;
    if (/^Does this form look/i.test(l)) continue;
    if (/^Forms$/i.test(l)) continue;
    if (/^You may need to select/i.test(l)) continue;
    lines.push(l);
  }

  const sections = {};
  let curSection = null;
  let cur = null;
  let qIdCounter = 0;
  let pendingAnswer = null;  // array of answer text lines
  let seenBlankAfterQ = false;
  let inCodeBlock = false;  // true between "Answer the question N" and the next question start
  let resumedQuestion = false;  // true after appending an inline score marker back to question text

  function flush() {
    if (!cur) { pendingAnswer = null; resumedQuestion = false; return; }
    if (!cur.options.length) { cur = null; pendingAnswer = null; seenBlankAfterQ = false; resumedQuestion = false; return; }
    if (pendingAnswer) {
      const ansText = pendingAnswer.map(l => l.trim()).join(' ').trim();
      cur.answer = resolveAnswer(ansText, cur.options);
    }
    cur.answer = cur.answer || '';
    if (!sections[curSection]) sections[curSection] = [];
    sections[curSection].push(cur);
    cur = null;
    pendingAnswer = null;
    seenBlankAfterQ = false;
  }

  function isSectionHeader(l) {
    // Actual section headers never contain commas (intro paragraph lines do)
    if (l.includes(',')) return false;
    for (const name of SECTION_NAMES) {
      if (l.startsWith(name) || l.startsWith(name.replace(/^Fundamentals of /, ''))) return true;
    }
    return false;
  }

  function isScoreMarker(l) {
    return /^\*?\d+\/\d+$/.test(l);
  }

  // Check if a line is a "Correct answer" marker
  function isCorrectAnswer(l) {
    return /^Correct answer/i.test(l);
  }

  function isQuestionStart(l) {
    const m = l.match(/^(\d+)[\.\)]\s*(.*)/);
    if (!m) return false;
    const text = m[2];
    if (!text.length) return false;
    // Require text to start with uppercase letter or underscore (blank fill-in).
    // Filters out code lines like "10. }emp1=..." and "11. int main()".
    return /^[A-Z_]/.test(text);
  }

  function isCodeLineNumber(l, inBlock) {
    // Lines starting with a number and dot (with optional trailing text) in a code block
    if (inBlock && /^\d+\.\s/.test(l)) return true;
    // Bare code line numbers like "1." or "2."
    return /^\d+\.$/.test(l);
  }

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const nextIdx = i + 1;

    // Detect section headers
    if (isSectionHeader(l)) {
      flush();
      // Extract clean section name
      let sectionName = l.replace(/\s+\d+ of \d+ points.*$/, '').trim();
      // Pick the matching SECTION_NAME
      for (const name of SECTION_NAMES) {
        if (l.startsWith(name) || l.startsWith(name.replace(/^Fundamentals of /, ''))) {
          sectionName = name;
          break;
        }
      }
      curSection = sectionName;
      qIdCounter = 0;
      continue;
    }

    // Skip standalone "X of Y points" lines
    if (/^\d+ of \d+ points/.test(l)) continue;

    // Skip score markers
    if (isScoreMarker(l)) {
      if (cur && cur.options.length === 0 && seenBlankAfterQ) {
        cur.question += ' ' + l;
        seenBlankAfterQ = false;
        resumedQuestion = true;
      }
      continue;
    }

    // Skip "Answer the question N..." instruction lines and enter code-block mode
    if (/^Answer\s+(the\s+)?question\s+\d+/i.test(l)) { inCodeBlock = true; continue; }
    if (/^Based on the given/i.test(l)) continue;

    // Correct answer marker
    if (isCorrectAnswer(l)) {
      pendingAnswer = [];
      let j = i + 1;
      while (j < lines.length) {
        const al = lines[j].trim();
        if (!al || isScoreMarker(al) || isQuestionStart(al) || isSectionHeader(al) || isCorrectAnswer(al)) break;
        pendingAnswer.push(al);
        j++;
      }
      i = j - 1;
      continue;
    }

    // If we're collecting answer, skip (already handled above)
    if (pendingAnswer && !l) continue;

    // Question start
    if (isQuestionStart(l)) {
      flush();
      qIdCounter++;
      const qm = l.match(/^(\d+)[\.\)]\s*(.*)/);
      cur = { id: String(qIdCounter), question: qm[2], options: [], answerLetter: '' };
      if (!curSection) curSection = 'General';
      seenBlankAfterQ = false;
      inCodeBlock = false;
      resumedQuestion = false;
      continue;
    }

    // Skip code line numbers (bare digits or numbered code lines in blocks)
    if (isCodeLineNumber(l, inCodeBlock)) continue;

    // Auto-enter code-block mode when we see #include/struct outside of a question
    if (!inCodeBlock && cur && cur.options.length > 0 && /^#include/.test(l)) {
      inCodeBlock = true;
    }

    // Skip lines that are just code-like in inter-question code blocks.
    // Only applies when inCodeBlock is true so legitimate code-looking options
    // are NOT filtered.
    if (inCodeBlock && cur && seenBlankAfterQ) {
      // Filter code-like lines in inter-question code blocks
      if (/^(struct|int |float |char |double |cout|cin|#include|using |return |void |if |else |for |while |do |switch |case |break|public |class |string |address|employee|main\b|\{|\}|.*;)/.test(l)) continue;
      // Filter lines that are just punctuation (code placeholders like "........")
      if (/^[\p{P}\p{S}]+$/u.test(l)) continue;
    }

    if (!cur) {
      // Before any question, skip remaining header-like lines
      continue;
    }

    // Collect question text or options
    if (!l) {
      seenBlankAfterQ = true;
      continue;
    }

    if (!seenBlankAfterQ) {
      cur.question += ' ' + l;
    } else if (resumedQuestion && seenBlankAfterQ && cur.options.length === 0 && /^[a-z]/.test(l)) {
      // Continuation of question text that was split by a blank line + score marker
      cur.question += ' ' + l;
      resumedQuestion = false;
    } else {
      // When the question mentions code ("following program", "code fragment")
      // treat code-like lines after the first blank as question continuation
      const hasCodeContext = /(?:following program|following code|code fragment)/i.test(cur.question);
      const looksLikeCode = /^(#include|using |int |float |char |double |cout|cin|struct|class |public |return |void |if |else |for |while |do |switch |case |break|string |address|employee|main\b|\{|\})/.test(l);
      if (hasCodeContext && looksLikeCode && cur.options.length === 0) {
        cur.question += ' ' + l;
      } else {
        cur.options.push(l);
      }
    }
  }
  flush();
  return sections;
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
  { input: '/tmp/mock1-new.txt', parser: parseMock1Pdf, output: 'mock1.json', isExternal: true },
];

for (const { input, parser, output, isExternal } of configs) {
  const filePath = isExternal ? input : join(dataDir, input);
  const text = readFileSync(filePath, 'utf-8');
  const result = parser(text);
  const total = Object.values(result).reduce((s, qs) => s + qs.length, 0);
  const answered = Object.values(result).reduce((s, qs) => s + qs.filter(q => q.answer).length, 0);
  writeFileSync(join(dataDir, output), JSON.stringify(result, null, 2) + '\n');
  const sections_str = Object.keys(result).join(', ');
  console.log(`${input} → ${output}: ${Object.keys(result).length} section(s): [${sections_str}], ${total} questions (${answered} with answers)`);
}
