import { readFileSync, writeFileSync } from 'fs';

const FIXES = new Map([
  // HTML tag questions — answer missing angle brackets/HTML entities
  ['a. style', 'a. &lt;style&gt;'],
  ['a. input type = checkbox', 'a. &lt;input type = &quot;checkbox&quot;&gt;'],
  ['c. pre', 'c. &lt;pre&gt;'],
  // C++ — answer missing operators / wrong operators
  [
    'int a[3] = {2}; for(int b=0; b =3; b++) ; cout a[b];',
    'int a[3] = {2}; for(int b=0; b&lt;=3; b++) ; cout&lt;&lt;a[b];'
  ],
  ['cout fruits[1];', 'cout&lt;&lt;fruits[1];'],
  ['myfile Mesfin Akalu ;', 'myfile&lt;&lt;&quot;Mesfin Akalu&quot;;'],
  // ERP — missing ampersand HTML entity
  ['I, II, III, IV', 'I, II, III, &amp; IV'],
]);

function fixFile(fp) {
  const raw = readFileSync(fp, 'utf-8');
  const data = JSON.parse(raw);
  let changed = false;

  for (const section of Object.values(data)) {
    for (const q of section) {
      if (!q.options?.length) continue;

      if (FIXES.has(q.answer) && q.options.includes(FIXES.get(q.answer))) {
        const replacement = FIXES.get(q.answer);
        if (q.answer !== replacement) {
          console.log(`${fp}  "${q.question.slice(0, 50)}..."  "${q.answer}"  ->  "${replacement}"`);
          q.answer = replacement;
          changed = true;
        }
      }
    }
  }

  if (changed) {
    writeFileSync(fp, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    console.log(fp + ' fixed');
  }
}

fixFile('src/lib/data/mock2.json');
