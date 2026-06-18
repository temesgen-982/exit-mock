<script lang="ts">
	import QuestionCard from '$lib/components/QuestionCard.svelte';
	import type { Question } from '$lib/types';

	let {
		selectedCourse,
		activeQuestions,
		currentIndex = $bindable(),
		currentAnswers,
		revealed,
		score,
		sections = [],
		onanswerselected,
		onsummary
	}: {
		selectedCourse: string;
		activeQuestions: Question[];
		currentIndex: number;
		currentAnswers: Record<number, string>;
		revealed: boolean;
		score: number;
		sections: string[];
		onanswerselected: (index: number, option: string) => void;
		onsummary: () => void;
	} = $props();

	// Ensure currentIndex stays within bounds
	$effect(() => {
		if (currentIndex >= activeQuestions.length) {
			currentIndex = Math.max(0, activeQuestions.length - 1);
		}
	});

	const currentQuestion = $derived(activeQuestions[currentIndex]);
	const isLastQuestion = $derived(currentIndex >= activeQuestions.length - 1);
	const isLastCourse = $derived(sections.indexOf(selectedCourse) >= sections.length - 1);
	const totalAnswered = $derived(Object.keys(currentAnswers).length);

	function handlePrevious() {
		if (currentIndex > 0) {
			currentIndex--;
		}
	}

	function handleNext() {
		if (isLastQuestion) {
			if (isLastCourse) {
				onsummary();
			}
		} else {
			currentIndex++;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft') {
			handlePrevious();
		} else if (event.key === 'ArrowRight') {
			handleNext();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="flex min-h-0 flex-1 flex-col">
	<div class="flex flex-none items-center justify-between border-b p-3">
		<span class="font-bold">{selectedCourse}</span>
		<div class="flex items-center gap-2">
			{#if totalAnswered > 0}
				<button
					class="text-xs text-muted-foreground underline-offset-2 hover:underline"
					onclick={onsummary}
				>
					Summary
				</button>
			{/if}
			{#if revealed}
				<span class="text-sm text-muted-foreground" aria-live="polite">{score}/{activeQuestions.length}</span>
			{/if}
		</div>
	</div>

	
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
				onselect={(option) => onanswerselected(currentIndex, option)}
			/>
		</div>

		<div class="flex flex-none items-center justify-between border-t p-3">
			<span class="text-xs text-muted-foreground" aria-live="polite">
				{currentIndex + 1} of {activeQuestions.length}
			</span>
			<div class="flex gap-2">
				<button
					class="rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-muted
						{currentIndex === 0 ? 'opacity-30' : ''}"
					onclick={handlePrevious}
					disabled={currentIndex === 0}
					aria-label="Previous question (← Arrow key)"
					title="Use ← arrow key to navigate"
				>
					Previous
				</button>
				<button
					class="rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-muted
						{isLastQuestion && isLastCourse ? 'opacity-30' : ''}"
					onclick={handleNext}
					disabled={isLastQuestion && isLastCourse}
					aria-label={isLastQuestion ? (isLastCourse ? 'View summary' : 'Next course') : 'Next question (→ Arrow key)'}
					title={isLastQuestion ? 'View summary' : 'Use → arrow key to navigate'}
				>
					{isLastQuestion ? (isLastCourse ? 'Summary' : 'Next Course') : 'Next'}
				</button>
			</div>
		</div>
	{/if}
</div>
