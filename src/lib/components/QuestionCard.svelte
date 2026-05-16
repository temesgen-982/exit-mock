<script lang="ts">
	import type { Question } from '$lib/types';

	let {
		item,
		index,
		answer,
		onselect
	}: {
		item: Question;
		index: number;
		answer: string | undefined;
		onselect: (option: string) => void;
	} = $props();

	let correct = $derived(answer == null ? null : answer === item.answer);
</script>

<div class="rounded-lg border p-4">
	<p class="mb-3 text-sm font-semibold">Q{index + 1}. {item.question}</p>

	{#if item.options?.length}
		<div class="space-y-1.5">
			{#each item.options as option (option)}
				<button
					class="flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors
						{answer === option
						? correct
							? 'border-green-500 bg-green-50 text-green-800'
							: 'border-red-500 bg-red-50 text-red-800'
						: 'hover:bg-muted'}"
					onclick={() => onselect(option)}
				>
					<span
						class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px]
							{answer === option ? 'border-current' : 'border-muted-foreground'}"
					>
						{answer === option ? (correct ? '✓' : '✗') : ''}
					</span>
					{option}
				</button>
			{/each}
		</div>
	{/if}

	{#if answer && !correct}
		<p class="mt-2 text-xs text-green-700">Answer: {item.answer}</p>
	{/if}
</div>
