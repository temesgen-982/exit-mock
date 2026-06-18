import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'src', 'lib', 'data');
const files = readdirSync(dataDir).filter((f) => f.endsWith('.json')).map((f) => join(dataDir, f));

function normalize(s) {
  return s.trim().replace(/\s+/g, ' ');
}

function stripPrefix(s) {
  return s.replace(/^[a-zA-Z]\.\s*/, '').trim();
}

function stripAllSpaces(s) {
  return s.replace(/\s+/g, '');
}

let totalFixed = 0;
let totalQuestions = 0;

for (const file of files) {
  const raw = readFileSync(file, 'utf-8');
  const data = JSON.parse(raw);
  let changed = false;

  for (const section of Object.values(data)) {
    for (const q of section) {
      totalQuestions++;

      // Skip empty/broken questions
      if (!q.answer || !q.options?.length) {
        console.log(`BROKEN  ${file}  "${q.question?.slice(0, 60) || '(empty)'}"  no answer or options`);
        continue;
      }

      const normAnswer = normalize(q.answer);
      const strippedAnswer = stripPrefix(normAnswer);

      // Pass 1: exact match after strip + normalize
      let match = q.options.find(
        (o) => stripPrefix(normalize(o)) === strippedAnswer
      );

      // Pass 2: fuzzy — compare after removing ALL whitespace (handles merged words)
      if (!match) {
        const spaceFreeAnswer = stripAllSpaces(strippedAnswer);
        match = q.options.find((o) => {
          return stripAllSpaces(stripPrefix(normalize(o))) === spaceFreeAnswer;
        });
      }

      if (!match) {
        console.log(
          `MISMATCH  ${file}  "${q.question.slice(0, 60)}..."  "${q.answer}"`
        );
        continue;
      }

      // Determine which version is "better" (has more spaces = more properly separated words)
      const answerSpaces = (q.answer.match(/ /g) || []).length;
      const matchSpaces = (match.match(/ /g) || []).length;

      if (q.answer !== match) {
        if (answerSpaces >= matchSpaces) {
          // Answer is as good or better — fix the option
          const idx = q.options.indexOf(match);
          console.log(
            `FIX_OPTION  ${file}  "${q.question.slice(0, 40)}..."  "${match}"  ->  "${q.answer}"`
          );
          q.options[idx] = q.answer;
          changed = true;
          totalFixed++;
        } else {
          // Option is better — fix the answer
          console.log(
            `FIX_ANSWER  ${file}  "${q.question.slice(0, 40)}..."  "${q.answer}"  ->  "${match}"`
          );
          q.answer = match;
          changed = true;
          totalFixed++;
        }
      }
    }
  }

  if (changed) {
    writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  }
}

console.log(`\nDone. ${totalFixed} fixes across ${totalQuestions} questions in ${files.length} file(s).`);
