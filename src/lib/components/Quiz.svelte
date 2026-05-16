<script lang="ts">
	import type { QuizData } from '$lib/types';
	import QuestionCard from '$lib/components/QuestionCard.svelte';

	let { quizData }: { quizData: QuizData } = $props();

	let sections = $derived(Object.keys(quizData));
	let selectedCourse = $state('');

	$effect(() => {
		selectedCourse = sections[0] ?? '';
		currentIndex = 0;
		answers = {};
	});

	let currentIndex = $state(0);
	let answers = $state<Record<number, string>>({});
	let activeQuestions = $derived(quizData[selectedCourse] ?? []);
	let score = $derived(activeQuestions.filter((q, i) => answers[i] === q.answer).length);
	let currentQuestion = $derived(activeQuestions[currentIndex]);
</script>

<!-- Sidebar -->
<div class="col-span-3 flex flex-col overflow-y-auto border-r">
	<div class="border-b p-3 font-bold">Courses</div>
	<div class="flex-1 space-y-1 p-2">
		{#each sections as course (course)}
			<button
				class="w-full rounded px-3 py-1.5 text-left text-sm transition-colors
					{selectedCourse === course ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}"
				onclick={() => {
					selectedCourse = course;
					currentIndex = 0;
					answers = {};
				}}
			>
				{course}
			</button>
		{/each}
	</div>
</div>

<!-- Questions panel -->
<div class="col-span-9 flex flex-col">
	<div class="flex items-center justify-between border-b p-3">
		<span class="font-bold">{selectedCourse}</span>
		<span class="text-sm text-muted-foreground">{score}/{activeQuestions.length}</span>
	</div>

	<div class="flex flex-1 flex-col">
		{#if activeQuestions.length === 0}
			<div class="flex flex-1 items-center justify-center p-4">
				<p class="text-sm text-muted-foreground italic">No questions for this course.</p>
			</div>
		{:else}
			<div class="flex-1 overflow-y-auto p-4">
				<QuestionCard
					item={currentQuestion}
					index={currentIndex}
					answer={answers[currentIndex]}
					onselect={(option) => {
						answers = { ...answers, [currentIndex]: option };
					}}
				/>
			</div>

			<div class="flex items-center justify-between border-t p-3">
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
							{currentIndex >= activeQuestions.length - 1 ? 'opacity-30' : ''}"
						onclick={() => {
							if (currentIndex < activeQuestions.length - 1) currentIndex++;
						}}
					>
						Next
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
