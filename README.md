# exit-mock

Interactive mock exam quiz app for Information Systems exit exam preparation. Built with Svelte 5 + SvelteKit + Tailwind CSS 4 + shadcn-svelte.

## Development

```sh
pnpm dev       # start dev server
pnpm build     # production build (static site)
pnpm preview   # preview production build
pnpm check     # type-check with svelte-check
```

## Project structure

```
src/
├── lib/
│   ├── data/
│   │   ├── mock1.json    # Mock exam 1 (120 questions)
│   │   └── mock2.json    # Mock exam 2 (140 questions)
│   ├── components/ui/    # shadcn components
│   ├── types.ts          # Question, QuizData, MockMeta types
│   └── utils.ts          # cn() utility
├── routes/
│   ├── +page.svelte      # Main page — mock selection + quiz interface
│   ├── +page.ts          # Loads both mock datasets
│   └── api/question/[id]/  # Per-question API (prerendered static JSON)
```

## Data

Exam questions are stored as JSON files grouped by course section under `src/lib/data/`. Raw source files and extraction scripts live in `exam_resources/`.
