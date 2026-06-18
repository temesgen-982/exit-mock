# exit-mock

Interactive mock exam quiz app for Information Systems exit exam preparation. Built with Svelte 5 + SvelteKit + Tailwind CSS 4 + shadcn-svelte.

## Development

```sh
pnpm dev          # start dev server
pnpm build        # production build (static site)
pnpm preview      # preview production build
pnpm check        # type-check with svelte-check
pnpm lint         # lint with prettier + eslint
pnpm format       # format with prettier
```

## Project structure

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/              # shadcn components
│   │   ├── AnalysisDialog   # Score breakdown dialog
│   │   ├── ExportDialog     # Export results dialog
│   │   ├── ImportDialog     # Import results dialog
│   │   ├── MockSelector     # Mock exam selector
│   │   ├── QuestionCard     # Question display with options
│   │   ├── Quiz             # Main quiz logic
│   │   ├── QuizMain         # Quiz layout wrapper
│   │   ├── QuizProgress     # Progress bar
│   │   ├── QuizSidebar      # Question navigation sidebar
│   │   ├── QuizSummary      # Results summary screen
│   │   ├── ResumePrompt     # Resume from localStorage prompt
│   │   ├── SettingsDialog    # Quiz settings
│   │   └── ThemeToggle       # Light/dark mode toggle
│   ├── data/
│   │   ├── mock1.json       # Mock exam 1 (120 questions)
│   │   └── mock2.json       # Mock exam 2 (140 questions)
│   ├── hooks/
│   │   └── is-mobile.svelte.ts  # Mobile detection
│   ├── types.ts             # Question, QuizData, MockMeta types
│   └── utils.ts             # cn() utility
├── routes/
│   ├── +layout.svelte       # Root layout with sidebar
│   ├── +page.svelte         # Landing page — mock selection
│   ├── +page.ts             # Loads mock list
│   ├── [mock]/+page.svelte  # Quiz page for a specific mock
│   ├── [mock]/+page.ts      # Loads mock data
│   └── api/question/[id]/   # Per-question API (prerendered static JSON)
└── app.html                 # SvelteKit HTML shell
```

## Data

Exam questions are stored as JSON files under `src/lib/data/`. Each file contains questions grouped by course section.
