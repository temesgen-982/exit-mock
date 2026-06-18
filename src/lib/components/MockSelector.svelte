<script lang="ts">
	import type { QuizData, MockMeta } from '$lib/types';
	import X from '@lucide/svelte/icons/x';
	import Pencil from '@lucide/svelte/icons/pencil';
	import ImportDialog from '$lib/components/ImportDialog.svelte';

	let {
		mockMeta,
		mocks,
		selectedMock = $bindable(),
		onstart,
		ondelete,
		onimport
	}: {
		mockMeta: MockMeta[];
		mocks: Record<string, QuizData>;
		selectedMock: string;
		onstart: () => void;
		ondelete?: (key: string) => void;
		onimport?: () => void;
	} = $props();

	let deleting = $state(false);

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			const start = event.target as HTMLElement;
			if (start.textContent?.includes('Start')) {
				onstart();
			}
		}
	}
</script>

<div class="col-span-12 flex flex-col">
	<div class="flex items-center justify-between border-b p-3">
		<span class="font-bold">Select Mock Exam</span>
		<button
			class="rounded p-1 text-muted-foreground transition-colors hover:text-foreground {deleting
				? 'text-primary'
				: ''}"
			onclick={() => (deleting = !deleting)}
			aria-pressed={deleting}
			title={deleting ? 'Exit delete mode' : 'Enter delete mode'}
			aria-label={deleting ? 'Exit delete mode for custom exams' : 'Enter delete mode to remove custom exams'}
		>
			<Pencil class="h-4 w-4" />
		</button>
	</div>
	<div class="flex flex-1 flex-col p-4">
		<div class="flex flex-1 flex-col justify-center">
			<div class="grid grid-cols-2 gap-4">
				{#each mockMeta as mock (mock.key)}
					<div class="relative">
						<button
							class="w-full border p-4 text-left transition-colors
							{selectedMock === mock.key ? 'border-primary bg-primary/5' : 'hover:bg-muted'}"
							onclick={() => {
								if (deleting) return;
								selectedMock = mock.key;
							}}
							role="radio"
							aria-checked={selectedMock === mock.key}
							aria-label={`${mock.label}, ${Object.values(mocks[mock.key] ?? {}).reduce((a: number, b) => a + b.length, 0)} questions`}
						>
							<div class="flex items-center justify-between">
								<span class="font-semibold">{mock.label}</span>
							</div>
							<div class="flex items-center justify-between">
								<span class="text-sm text-muted-foreground">
									{Object.values(mocks[mock.key] ?? {}).reduce((a: number, b) => a + b.length, 0)} questions
								</span>
								{#if selectedMock === mock.key}
									<span class="text-primary" aria-hidden="true">✓</span>
								{/if}
							</div>
						</button>
						{#if mock.source === 'custom' && ondelete && deleting}
							<button
								class="absolute top-1 right-1 rounded p-0.5 text-destructive transition-opacity hover:opacity-80"
								onclick={(e) => {
									e.stopPropagation();
									ondelete(mock.key);
								}}
								aria-label={`Delete ${mock.label}`}
								title={`Delete ${mock.label}`}
							>
								<X class="h-3.5 w-3.5" />
							</button>
						{/if}
					</div>
				{/each}
			</div>
		</div>
		<div class="flex items-center justify-between">
			<ImportDialog onimport={onimport} />
			<button
				class="bg-primary px-6 py-2 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
				onclick={onstart}
				onkeydown={handleKeydown}
				aria-label={`Start quiz with ${selectedMock}`}
			>
				Start Quiz
			</button>
		</div>
	</div>
</div>
