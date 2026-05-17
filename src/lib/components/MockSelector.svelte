<script lang="ts">
	import type { QuizData, MockMeta } from '$lib/types';

	let {
		mockMeta,
		mocks,
		selectedMock = $bindable(),
		onstart
	}: {
		mockMeta: MockMeta[];
		mocks: Record<string, QuizData>;
		selectedMock: string;
		onstart: () => void;
	} = $props();
</script>

<div class="col-span-12 flex flex-col">
	<div class="border-b p-3 font-bold">Select Mock Exam</div>
	<div class="flex flex-1 flex-col p-4">
		<div class="flex flex-1 flex-col justify-center">
			<div class="grid grid-cols-2 gap-4">
				{#each mockMeta as mock (mock.key)}
					<button
						class="w-full border p-4 text-left transition-colors
						{selectedMock === mock.key ? 'border-primary bg-primary/5' : 'hover:bg-muted'}"
						onclick={() => {
							selectedMock = mock.key;
						}}
					>
						<div class="flex items-center justify-between">
							<span class="font-semibold">{mock.label}</span>
							{#if selectedMock === mock.key}
								<span class="text-primary">✓</span>
							{/if}
						</div>
						<span class="text-sm text-muted-foreground">
							{Object.values(mocks[mock.key] ?? {}).reduce((a: number, b) => a + b.length, 0)} questions
						</span>
					</button>
				{/each}
			</div>
		</div>
		<div class="flex justify-end">
			<button
				class="bg-primary px-6 py-2 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
				onclick={onstart}
			>
				Start Quiz
			</button>
		</div>
	</div>
</div>
