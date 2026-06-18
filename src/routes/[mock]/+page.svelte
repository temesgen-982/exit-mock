<script lang="ts">
	import type { QuizData } from '$lib/types';
	import Quiz from '$lib/components/Quiz.svelte';
	import ResumePrompt from '$lib/components/ResumePrompt.svelte';
	import SettingsDialog from '$lib/components/SettingsDialog.svelte';
	import AnalysisDialog from '$lib/components/AnalysisDialog.svelte';
	import ExportDialog from '$lib/components/ExportDialog.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import { toast } from 'svelte-sonner';

	let { data }: { data: { quizData: QuizData | null; mockKey: string } } = $props();
	let quizData = $state<QuizData | null>(null);
	let loadError = $state<string | null>(null);
	let isLoading = $state(true);
	let showResumePrompt = $state(false);
	let savedProgress = $state<{ answeredCount: number; correctCount: number; totalCount: number } | null>(null);

	function calculateProgress(
		quizData: QuizData,
		answers: Record<string, Record<number, string>>
	): { answeredCount: number; correctCount: number; totalCount: number } {
		let totalQuestions = 0;
		let answeredCount = 0;
		let correctCount = 0;

		for (const course in quizData) {
			const questions = quizData[course];
			totalQuestions += questions.length;
			const courseAnswers = answers[course] ?? {};
			for (let i = 0; i < questions.length; i++) {
				if (courseAnswers[i] != null) {
					answeredCount++;
					if (courseAnswers[i] === questions[i].answer) {
						correctCount++;
					}
				}
			}
		}

		return { answeredCount, correctCount, totalCount: totalQuestions };
	}

	function handleResumeQuiz() {
		showResumePrompt = false;
	}

	function handleFreshStart() {
		showResumePrompt = false;
		localStorage.removeItem(`exit-mock-answers-${data.mockKey}`);
		toast.success('Fresh start', {
			description: 'Previous progress cleared'
		});
	}

	function attemptLoad() {
		isLoading = true;
		loadError = null;
		quizData = null;
		showResumePrompt = false;

		if (data.quizData) {
			quizData = data.quizData;
			
			// Check for saved progress
			const savedAnswers = localStorage.getItem(`exit-mock-answers-${data.mockKey}`);
			if (savedAnswers) {
				try {
					const answers = JSON.parse(savedAnswers);
					savedProgress = calculateProgress(data.quizData, answers);
					showResumePrompt = true;
				} catch {
					// Invalid saved state, continue normally
				}
			}
			isLoading = false;
			return;
		}
		try {
			const stored = localStorage.getItem('exit-mock-custom-mocks');
			if (stored) {
				const mocks: { key: string; label: string; data: QuizData }[] = JSON.parse(stored);
				const mock = mocks.find((m) => m.key === data.mockKey);
				if (mock) {
					quizData = mock.data;
					
					// Check for saved progress
					const savedAnswers = localStorage.getItem(`exit-mock-answers-${data.mockKey}`);
					if (savedAnswers) {
						try {
							const answers = JSON.parse(savedAnswers);
							savedProgress = calculateProgress(mock.data, answers);
							showResumePrompt = true;
						} catch {
							// Invalid saved state, continue normally
						}
					}
				} else {
					loadError = 'The requested exam could not be found.';
					toast.error('Exam not found', {
						description: 'The requested exam could not be loaded'
					});
				}
			} else {
				loadError = 'No custom exams are available in storage.';
				toast.error('No custom exams available');
			}
		} catch (error) {
			loadError = error instanceof Error ? error.message : 'Storage may be corrupted';
			toast.error('Failed to load custom exam', {
				description: loadError
			});
		} finally {
			isLoading = false;
		}
	}

	$effect(() => {
		attemptLoad();
	});
</script>

<main class="flex h-screen flex-col">
	<a href="#main-content" class="sr-only focus:not-sr-only">Skip to main content</a>
	<nav class="flex-none border-b p-4" aria-label="Quiz navigation">
		<div class="flex items-center justify-between">
			<SettingsDialog mockKey={data.mockKey} />
			<div class="flex gap-2">
				<a
					href="/"
					class="flex items-center gap-1 border p-2 text-sm text-muted-foreground hover:text-foreground"
					aria-label="Go back to mock selection"
				>
					<ChevronLeft /> Back
				</a>
				<AnalysisDialog />
				<ExportDialog />
				<ThemeToggle />
			</div>
		</div>
	</nav>
	{#if showResumePrompt && savedProgress}
		<ResumePrompt
			mockLabel={data.mockKey}
			progress={savedProgress}
			onresume={handleResumeQuiz}
			onfresh={handleFreshStart}
		/>
	{/if}
	<div class="honeycomb-bg paused relative flex flex-1 items-center justify-center p-4">
		<div class="absolute inset-0 bg-background/40 backdrop-blur-sm"></div>
		<div id="main-content" class="relative grid h-full max-h-(--central-max-h) w-full max-w-[800px] grid-cols-12 border-2 bg-card shadow-xl">
			{#if quizData}
				<Quiz {quizData} mockKey={data.mockKey} />
			{:else if loadError}
				<div class="col-span-12 flex flex-col items-center justify-center gap-4 p-6 text-center">
					<div class="text-sm text-destructive font-medium">Error Loading Exam</div>
					<p class="text-xs text-muted-foreground max-w-xs">{loadError}</p>
					<div class="flex gap-2">
						<button
							class="rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
							onclick={attemptLoad}
						>
							Retry
						</button>
						<a
							href="/"
							class="rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
						>
							Back to Home
						</a>
					</div>
				</div>
			{:else}
				<div class="col-span-12 flex flex-col items-center justify-center gap-3 text-center">
					<div class="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground"></div>
					<div class="text-sm text-muted-foreground">Loading exam...</div>
				</div>
			{/if}
		</div>
	</div>
</main>
