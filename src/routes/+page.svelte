<script lang="ts">
	import type { QuizData, MockMeta } from '$lib/types';
	import MockSelector from '$lib/components/MockSelector.svelte';
	import Quiz from '$lib/components/Quiz.svelte';

	let { data }: { data: { mocks: Record<string, QuizData>; mockMeta: MockMeta[] } } = $props();

	let started = $state(false);
	let selectedMock = $state('mock1');
</script>

<main class="flex h-screen flex-col">
	<nav class="flex-none border-b p-4">
		<div class="flex items-center justify-between">
			<span class="font-bold">exit-mock</span>
			{#if started}
				<button
					class="text-sm text-muted-foreground hover:text-foreground"
					onclick={() => {
						started = false;
					}}
				>
					← Back
				</button>
			{/if}
		</div>
	</nav>

	<div class="flex flex-1 items-center justify-center p-4">
		<div class="grid h-full max-h-[500px] w-full max-w-[900px] grid-cols-12 border">
			{#if !started}
				<MockSelector
					mockMeta={data.mockMeta}
					mocks={data.mocks}
					bind:selectedMock
					onstart={() => {
						started = true;
					}}
				/>
			{:else}
				<Quiz quizData={data.mocks[selectedMock]} />
			{/if}
		</div>
	</div>
</main>
