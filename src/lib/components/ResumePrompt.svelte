<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	let {
		mockLabel,
		progress,
		onresume,
		onfresh
	}: {
		mockLabel: string;
		progress: { answeredCount: number; correctCount: number; totalCount: number };
		onresume: () => void;
		onfresh: () => void;
	} = $props();
</script>

<Dialog.Root open={true}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Resume Quiz?</Dialog.Title>
			<Dialog.Description>
				We found your previous progress in <strong>{mockLabel}</strong>
			</Dialog.Description>
		</Dialog.Header>

		<div class="rounded-lg bg-muted p-4">
			<div class="space-y-2">
				<div class="flex items-center justify-between text-sm">
					<span class="text-muted-foreground">Questions answered:</span>
					<span class="font-semibold">{progress.answeredCount}/{progress.totalCount}</span>
				</div>
				<div class="flex items-center justify-between text-sm">
					<span class="text-muted-foreground">Correct answers:</span>
					<span class="font-semibold text-green-600">{progress.correctCount}</span>
				</div>
				<div class="h-1 w-full rounded bg-background">
					<div
						class="h-full rounded bg-primary transition-all"
						style="width: {(progress.answeredCount / progress.totalCount) * 100}%"
					></div>
				</div>
			</div>
		</div>

		<Dialog.Footer class="flex gap-2 sm:justify-between">
			<button
				class="flex-1 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted"
				onclick={onfresh}
			>
				Start Fresh
			</button>
			<button
				class="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
				onclick={onresume}
			>
				Resume
			</button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
