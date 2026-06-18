<script lang="ts">
	import type { QuizData } from '$lib/types';

	let {
		totalCorrect,
		totalQuestions,
		percentage,
		courseStats,
		onreview,
		onbacktomocks
	}: {
		totalCorrect: number;
		totalQuestions: number;
		percentage: number;
		courseStats: Array<{ course: string; total: number; answered: number; correct: number }>;
		onreview: () => void;
		onbacktomocks: () => void;
	} = $props();
</script>

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
			onclick={onreview}
		>
			Review Answers
		</button>
		<button
			class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
			onclick={onbacktomocks}
		>
			Back to Mocks
		</button>
	</div>
</div>
