<script lang="ts">
	import type { QuizData } from '$lib/types';
	import Quiz from '$lib/components/Quiz.svelte';
	import SettingsDialog from '$lib/components/SettingsDialog.svelte';
	import AnalysisDialog from '$lib/components/AnalysisDialog.svelte';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';
	import { toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';

	let { data }: { data: { quizData: QuizData; mockKey: string } } = $props();
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
				<Button onclick={toggleMode} variant="outline" size="icon">
					<Sun
						class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90"
					/>
					<Moon
						class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0"
					/>
					<span class="sr-only">Toggle theme</span>
				</Button>
			</div>
		</div>
	</nav>
	<div class="honeycomb-bg flex flex-1 items-center justify-center p-4">
		<div class="grid h-full max-h-[450px] w-full max-w-[800px] grid-cols-12 border-2 bg-card shadow-xl">
			<Quiz quizData={data.quizData} mockKey={data.mockKey} />
		</div>
	</div>
</main>
