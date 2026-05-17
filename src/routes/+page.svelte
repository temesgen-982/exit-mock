<script lang="ts">
	import type { QuizData, MockMeta } from '$lib/types';
	import MockSelector from '$lib/components/MockSelector.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import SettingsDialog from '$lib/components/SettingsDialog.svelte';
	import AnalysisDialog from '$lib/components/AnalysisDialog.svelte';
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
				<ThemeToggle />
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
