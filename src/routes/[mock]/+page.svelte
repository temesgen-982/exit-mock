<script lang="ts">
	import type { QuizData } from '$lib/types';
	import Quiz from '$lib/components/Quiz.svelte';
	import SettingsDialog from '$lib/components/SettingsDialog.svelte';
	import AnalysisDialog from '$lib/components/AnalysisDialog.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';

	let { data }: { data: { quizData: QuizData | null; mockKey: string } } = $props();
	let quizData = $state<QuizData | null>(null);

	$effect(() => {
		if (data.quizData) {
			quizData = data.quizData;
			return;
		}
		try {
			const stored = localStorage.getItem('exit-mock-custom-mocks');
			if (stored) {
				const mocks = JSON.parse(stored);
				const mock = mocks.find((m: any) => m.key === data.mockKey);
				if (mock) quizData = mock.data;
			}
		} catch {
			/* ignore */
		}
	});
</script>

<main class="flex h-screen flex-col">
	<nav class="flex-none border-b p-4">
		<div class="flex items-center justify-between">
			<SettingsDialog mockKey={data.mockKey} />
			<div class="flex gap-2">
				<a
					href="/"
					class="flex items-center gap-1 border p-2 text-sm text-muted-foreground hover:text-foreground"
				>
					<ChevronLeft /> Back
				</a>
				<AnalysisDialog />
				<ThemeToggle />
			</div>
		</div>
	</nav>
	<div class="honeycomb-bg paused relative flex flex-1 items-center justify-center p-4">
		<div class="absolute inset-0 bg-background/40 backdrop-blur-sm"></div>
		<div class="relative grid h-full max-h-[450px] w-full max-w-[800px] grid-cols-12 border-2 bg-card shadow-xl">
			{#if quizData}
				<Quiz {quizData} mockKey={data.mockKey} />
			{:else}
				<div class="col-span-12 flex items-center justify-center text-sm text-muted-foreground">
					Loading...
				</div>
			{/if}
		</div>
	</div>
</main>
