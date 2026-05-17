<script lang="ts">
	import type { QuizData, MockMeta } from '$lib/types';
	import MockSelector from '$lib/components/MockSelector.svelte';
	import SettingsDialog from '$lib/components/SettingsDialog.svelte';
	import AnalysisDialog from '$lib/components/AnalysisDialog.svelte';
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';
	import { toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';
	import { goto } from '$app/navigation';

	let { data }: { data: { mocks: Record<string, QuizData>; mockMeta: MockMeta[] } } = $props();
	let selectedMock = $state('mock1');
</script>

<main class="flex h-screen flex-col">
	<nav class="flex-none border-b p-4">
		<div class="flex items-center justify-between">
			<SettingsDialog />
			<div class="flex items-center gap-2">
				<AnalysisDialog />
				<button
					onclick={toggleMode}
					class="relative inline-flex items-center justify-center border border-border p-2 hover:bg-input/50"
				>
					<Sun class="size-5 scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90" />
					<Moon
						class="absolute size-5 scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0"
					/>
					<span class="sr-only">Toggle theme</span>
				</button>
			</div>
		</div>
	</nav>

	<div class="honeycomb-bg flex flex-1 items-center justify-center p-4">
		<div
			class="grid h-full max-h-[450px] w-full max-w-[800px] grid-cols-12 border-2 bg-card shadow-xl"
		>
			<MockSelector
				mockMeta={data.mockMeta}
				mocks={data.mocks}
				bind:selectedMock
				onstart={() => goto(`/${selectedMock}`)}
			/>
		</div>
	</div>
</main>
