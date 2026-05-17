<script lang="ts">
	import Settings from '@lucide/svelte/icons/settings';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Alert from '$lib/components/ui/alert-dialog/index.js';
	import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

	let { mockKey }: { mockKey?: string } = $props();
	let open = $state(false);
	let revealMode = $state('per-question');

	$effect(() => {
		if (!open) return;
		try {
			const saved = localStorage.getItem('exit-mock-settings');
			if (saved) {
				const parsed = JSON.parse(saved);
				if (parsed.revealMode) revealMode = parsed.revealMode;
			}
		} catch {
			/* ignore */
		}
	});

	$effect(() => {
		if (!open) return;
		localStorage.setItem('exit-mock-settings', JSON.stringify({ revealMode }));
	});

	function handleReset() {
		if (!mockKey) return;
		localStorage.removeItem(`exit-mock-${mockKey}`);
		window.location.reload();
	}

	function handleResetAll() {
		const keys = Object.keys(localStorage).filter((k) => k.startsWith('exit-mock-'));
		keys.forEach((k) => localStorage.removeItem(k));
		window.location.reload();
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger
		class="flex items-center gap-1 border p-2 text-sm text-muted-foreground hover:text-foreground"
	>
		<Settings />
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Settings</Dialog.Title>
			<Dialog.Description>Manage your mock exam preferences and data.</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-6">
			<div class="space-y-3">
				<p class="text-sm font-medium">Reveal Answers</p>
				<RadioGroup bind:value={revealMode}>
					<div class="flex items-center gap-3">
						<RadioGroupItem value="per-question" id="r-per-question" />
						<label class="text-sm" for="r-per-question">After each question</label>
					</div>
					<div class="flex items-center gap-3">
						<RadioGroupItem value="per-course" id="r-per-course" />
						<label class="text-sm" for="r-per-course">After completing each course</label>
					</div>
					<div class="flex items-center gap-3">
						<RadioGroupItem value="per-quiz" id="r-per-quiz" />
						<label class="text-sm" for="r-per-quiz">Only in the summary</label>
					</div>
				</RadioGroup>
			</div>

			<hr class="border-t" />

			<div class="space-y-3">
				{#if mockKey}
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-medium">Reset Progress</p>
							<p class="text-xs text-muted-foreground">Clear saved answers for this mock</p>
						</div>
						<Alert.Root>
							<Alert.Trigger
								class="text-destructive-foreground rounded-md bg-destructive px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-90"
							>
								Reset
							</Alert.Trigger>
							<Alert.Content>
								<Alert.Header>
									<Alert.Title>Reset Progress?</Alert.Title>
									<Alert.Description>
										This will clear all saved answers for this mock. This cannot be undone.
									</Alert.Description>
								</Alert.Header>
								<Alert.Footer>
									<Alert.Cancel>Cancel</Alert.Cancel>
									<Alert.Action onclick={handleReset}>Reset</Alert.Action>
								</Alert.Footer>
							</Alert.Content>
						</Alert.Root>
					</div>
				{/if}
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium">Reset All Progress</p>
						<p class="text-xs text-muted-foreground">Clear saved answers for all mocks</p>
					</div>
					<Alert.Root>
						<Alert.Trigger
							class="text-destructive-foreground rounded-md bg-destructive px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-90"
						>
							Reset All
						</Alert.Trigger>
						<Alert.Content>
							<Alert.Header>
								<Alert.Title>Reset All Progress?</Alert.Title>
								<Alert.Description>
									This will clear saved answers for all mocks. This cannot be undone.
								</Alert.Description>
							</Alert.Header>
							<Alert.Footer>
								<Alert.Cancel>Cancel</Alert.Cancel>
								<Alert.Action onclick={handleResetAll}>Reset All</Alert.Action>
							</Alert.Footer>
						</Alert.Content>
					</Alert.Root>
				</div>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
