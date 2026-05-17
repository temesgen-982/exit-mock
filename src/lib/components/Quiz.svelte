<script lang="ts">
	import type { QuizData } from '$lib/types';
	import QuestionCard from '$lib/components/QuestionCard.svelte';
	import PanelLeftClose from '@lucide/svelte/icons/panel-left-close';
	import PanelLeftOpen from '@lucide/svelte/icons/panel-left-open';

	let { quizData, mockKey }: { quizData: QuizData; mockKey?: string } = $props();

	let sections = $derived(Object.keys(quizData));
	let selectedCourse = $state('');
	let currentIndex = $state(0);
	let answers = $state<Record<string, Record<number, string>>>({});
	let showSummary = $state(false);
	let autoCompleted = $state(false);
	let revealMode = $state('per-question');
	let sidebarCollapsed = $state(false);

	$effect(() => {
		if (!mockKey) {
			selectedCourse = sections[0] ?? '';
			return;
		}
		try {
			const saved = localStorage.getItem(`exit-mock-${mockKey}`);
			if (saved) {
				const parsed = JSON.parse(saved);
				if (parsed.answers) answers = parsed.answers;
			}
		} catch {
			/* ignore */
		}
		try {
			const settings = localStorage.getItem('exit-mock-settings');
			if (settings) {
				const parsed = JSON.parse(settings);
				if (parsed.revealMode) revealMode = parsed.revealMode;
			}
		} catch {
			/* ignore */
		}
		selectedCourse = sections[0] ?? '';
		currentIndex = 0;
	});

	$effect(() => {
		if (!mockKey) return;
		localStorage.setItem(`exit-mock-${mockKey}`, JSON.stringify({ answers }));
	});

	let activeQuestions = $derived(quizData[selectedCourse] ?? []);
	let courseComplete = $derived(
		activeQuestions.length > 0 &&
			activeQuestions.every((_, i) => (answers[selectedCourse] ?? {})[i] != null)
	);
	let revealed = $derived(
		revealMode === 'per-question' || (revealMode === 'per-course' && courseComplete)
	);
	let isLastQuestion = $derived(currentIndex >= activeQuestions.length - 1);
	let currentCourseIndex = $derived(sections.indexOf(selectedCourse));
	let isLastCourse = $derived(currentCourseIndex >= sections.length - 1);
	let currentAnswers = $derived(answers[selectedCourse] ?? {});
	let score = $derived(activeQuestions.filter((q, i) => currentAnswers[i] === q.answer).length);
	let currentQuestion = $derived(activeQuestions[currentIndex]);

	let allAnswered = $derived(
		sections.every((course) =>
			(quizData[course] ?? []).every((_, i) => (answers[course] ?? {})[i] != null)
		)
	);

	$effect(() => {
		if (allAnswered && !autoCompleted) {
			showSummary = true;
			autoCompleted = true;
		}
	});

	let courseStats = $derived(
		sections.map((course) => {
			const questions = quizData[course] ?? [];
			const courseAnswers = answers[course] ?? {};
			const answered = questions.filter((_, i) => courseAnswers[i] != null).length;
			const correct = questions.filter((q, i) => courseAnswers[i] === q.answer).length;
			return { course, total: questions.length, answered, correct };
		})
	);
	let totalQuestions = $derived(courseStats.reduce((sum, s) => sum + s.total, 0));
	let totalAnswered = $derived(courseStats.reduce((sum, s) => sum + s.answered, 0));
	let totalCorrect = $derived(courseStats.reduce((sum, s) => sum + s.correct, 0));
	let percentage = $derived(
		totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
	);
	let progressWidth = $derived(totalQuestions > 0 ? (totalAnswered / totalQuestions) * 100 : 0);
</script>

<div class="col-span-12 flex min-h-0 flex-col">
	{#if showSummary}
		<div class="flex-none border-b p-3 font-bold">Quiz Complete</div>
		<div class="flex flex-1 flex-col items-center justify-start gap-6 overflow-y-auto p-8">
			<div class="text-center">
				<div class="text-4xl font-bold">
					{totalCorrect}<span class="text-2xl text-muted-foreground">/{totalQuestions}</span>
				</div>
				<div class="mt-1 text-sm text-muted-foreground">{percentage}% correct</div>
			</div>
			<div class="w-full max-w-sm space-y-2">
				{#each courseStats as stat (stat.course)}
					<div class="flex items-center justify-between text-sm">
						<span class="truncate">{stat.course}</span>
						<span
							class="shrink-0 tabular-nums {stat.correct === stat.total ? 'text-green-600' : ''}"
						>
							{stat.correct}/{stat.total}
						</span>
					</div>
				{/each}
			</div>
			<div class="flex gap-3">
				<button
					class="rounded-md border px-4 py-2 text-sm transition-colors hover:bg-muted"
					onclick={() => {
						showSummary = false;
					}}
				>
					Review Answers
				</button>
				<a
					href="/"
					class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
				>
					Back to Mocks
				</a>
			</div>
		</div>
	{:else}
		<!-- Progress bar -->
		<div class="h-1 flex-none bg-muted">
			<div
				class="h-full bg-primary transition-all duration-500"
				style="width: {progressWidth}%"
			></div>
		</div>

		<!-- Main area: sidebar + questions as a flex row -->
		<div class="flex min-h-0 flex-1">
			<!-- Sidebar -->
			<div
				class="{sidebarCollapsed
					? 'w-10'
					: 'w-1/4'} flex min-h-0 flex-col border-r transition-[width] duration-200"
			>
				<div class="flex-none {sidebarCollapsed ? 'p-2' : 'border-b p-3'}">
					<div class="flex items-center justify-between">
						{#if !sidebarCollapsed}<span class="font-bold">Courses</span>{/if}
						<button
							class="rounded p-1 text-muted-foreground hover:text-foreground"
							onclick={() => {
								sidebarCollapsed = !sidebarCollapsed;
							}}
						>
							{#if sidebarCollapsed}
								<PanelLeftOpen class="h-4 w-4" />
							{:else}
								<PanelLeftClose class="h-4 w-4" />
							{/if}
						</button>
					</div>
				</div>
				{#if !sidebarCollapsed}
					<div
						class="flex-1 space-y-1 overflow-y-auto p-2
						[&::-webkit-scrollbar]:w-4
						[&::-webkit-scrollbar-thumb]:bg-[hsl(var(--border))]
						[&::-webkit-scrollbar-track]:bg-transparent"
						style="scrollbar-width: thin; scrollbar-color: hsl(var(--border)) transparent"
					>
						{#each sections as course (course)}
							<button
								class="w-full rounded px-3 py-1.5 text-left text-sm transition-colors
								{selectedCourse === course ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}"
								onclick={() => {
									selectedCourse = course;
									currentIndex = 0;
								}}
							>
								{course}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Questions panel -->
			<div class="flex min-h-0 flex-1 flex-col">
				<div class="flex flex-none items-center justify-between border-b p-3">
					<span class="font-bold">{selectedCourse}</span>
					<div class="flex items-center gap-2">
						{#if totalAnswered > 0}
							<button
								class="text-xs text-muted-foreground underline-offset-2 hover:underline"
								onclick={() => {
									showSummary = true;
								}}
							>
								Summary
							</button>
						{/if}
						{#if revealed}
							<span class="text-sm text-muted-foreground">{score}/{activeQuestions.length}</span>
						{/if}
					</div>
				</div>

				<div class="flex min-h-0 flex-1 flex-col">
					{#if activeQuestions.length === 0}
						<div class="flex flex-1 items-center justify-center p-4">
							<p class="text-sm text-muted-foreground italic">No questions for this course.</p>
						</div>
					{:else}
						<div class="flex-1 overflow-y-auto p-4">
							<QuestionCard
								item={currentQuestion}
								index={currentIndex}
								answer={currentAnswers[currentIndex]}
								{revealed}
								onselect={(option) => {
									answers = {
										...answers,
										[selectedCourse]: { ...(answers[selectedCourse] ?? {}), [currentIndex]: option }
									};
								}}
							/>
						</div>

						<div class="flex flex-none items-center justify-between border-t p-3">
							<span class="text-xs text-muted-foreground">
								{currentIndex + 1} of {activeQuestions.length}
							</span>
							<div class="flex gap-2">
								<button
									class="rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-muted
										{currentIndex === 0 ? 'opacity-30' : ''}"
									onclick={() => {
										if (currentIndex > 0) currentIndex--;
									}}
								>
									Previous
								</button>
								<button
									class="rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-muted
										{isLastQuestion && isLastCourse ? 'opacity-30' : ''}"
									onclick={() => {
										if (isLastQuestion) {
											if (isLastCourse) {
												showSummary = true;
											} else {
												selectedCourse = sections[currentCourseIndex + 1];
												currentIndex = 0;
											}
										} else {
											currentIndex++;
										}
									}}
								>
									{isLastQuestion ? (isLastCourse ? 'Summary' : 'Next Course') : 'Next'}
								</button>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
