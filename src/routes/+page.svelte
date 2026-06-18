<script lang="ts">
	import type { QuizData, MockMeta } from '$lib/types';
	import MockSelector from '$lib/components/MockSelector.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import SettingsDialog from '$lib/components/SettingsDialog.svelte';
	import AnalysisDialog from '$lib/components/AnalysisDialog.svelte';
	import ExportDialog from '$lib/components/ExportDialog.svelte';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	let { data }: { data: { mocks: Record<string, QuizData>; mockMeta: MockMeta[] } } = $props();

	let allMocks = $state<Record<string, QuizData>>({});
	let allMockMeta = $state<MockMeta[]>([]);
	let selectedMock = $state('mock1');

	function syncCustomMocks() {
		try {
			const stored = localStorage.getItem('exit-mock-custom-mocks');
			const mocksCopy: Record<string, QuizData> = structuredClone(data.mocks);
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
		} catch (error) {
			toast.error('Failed to load custom exams', {
				description: error instanceof Error ? error.message : 'Storage may be corrupted'
			});
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
			toast.success('Exam deleted');
			syncCustomMocks();
		} catch (error) {
			toast.error('Failed to delete exam', {
				description: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}
</script>

<main class="flex h-screen flex-col">
	<a href="#main-content" class="sr-only focus:not-sr-only">Skip to main content</a>
	<nav class="flex-none border-b p-4" aria-label="Main navigation">
		<div class="flex items-center justify-between">
			<SettingsDialog />
			<div class="flex items-center gap-2">
				<AnalysisDialog />
				<ExportDialog />
				<ThemeToggle />
			</div>
		</div>
	</nav>

	<div class="honeycomb-bg flex flex-1 items-center justify-center p-4">
		<div
			id="main-content"
			class="grid h-full max-h-(--central-max-h) w-full max-w-[800px] grid-cols-12 border-2 bg-card shadow-xl overflow-y-auto"
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
