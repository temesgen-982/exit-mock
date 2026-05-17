<script lang="ts">
	import type { QuizData, MockMeta } from '$lib/types';
	import MockSelector from '$lib/components/MockSelector.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import SettingsDialog from '$lib/components/SettingsDialog.svelte';
	import AnalysisDialog from '$lib/components/AnalysisDialog.svelte';
	import { goto } from '$app/navigation';

	let { data }: { data: { mocks: Record<string, QuizData>; mockMeta: MockMeta[] } } = $props();

	let allMocks = $state<Record<string, QuizData>>({});
	let allMockMeta = $state<MockMeta[]>([]);
	let selectedMock = $state('mock1');

	function syncCustomMocks() {
		try {
			const stored = localStorage.getItem('exit-mock-custom-mocks');
			const mocksCopy: Record<string, QuizData> = { ...data.mocks };
			const metaCopy: MockMeta[] = [...data.mockMeta];
			if (stored) {
				const custom: { key: string; label: string; data: QuizData }[] = JSON.parse(stored);
				for (const item of custom) {
					mocksCopy[item.key] = item.data;
					metaCopy.push({ key: item.key, label: item.label, source: 'custom' });
				}
			}
			allMocks = mocksCopy;
			allMockMeta = metaCopy;
		} catch {
			/* ignore */
		}
	}

	$effect(syncCustomMocks);

	function handleDeleteMock(key: string) {
		try {
			const stored = localStorage.getItem('exit-mock-custom-mocks');
			if (!stored) return;
			const custom: { key: string; label: string; data: QuizData }[] = JSON.parse(stored);
			const filtered = custom.filter((m) => m.key !== key);
			localStorage.setItem('exit-mock-custom-mocks', JSON.stringify(filtered));
			syncCustomMocks();
			if (selectedMock === key) selectedMock = allMockMeta[0]?.key ?? '';
		} catch {
			/* ignore */
		}
	}
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
				mockMeta={allMockMeta}
				mocks={allMocks}
				bind:selectedMock
				onstart={() => goto(`/${selectedMock}`)}
				ondelete={handleDeleteMock}
				onimport={syncCustomMocks}
			/>
		</div>
	</div>
</main>
