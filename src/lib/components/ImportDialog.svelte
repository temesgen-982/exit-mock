<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Copy from '@lucide/svelte/icons/copy';
	import Check from '@lucide/svelte/icons/check';
	import Upload from '@lucide/svelte/icons/upload';
	import { toast } from 'svelte-sonner';
	import type { QuizData, Question } from '$lib/types';
	import { tryLocalStorageSet } from '$lib/utils';

	// 5MB file size limit
	const MAX_FILE_SIZE = 5 * 1024 * 1024;

	let { onimport }: { onimport?: () => void } = $props();

	let open = $state(false);
	let rawJson = $state('');
	let examName = $state('');
	let dragOver = $state(false);
	let fileInput: HTMLInputElement | undefined = $state();
	let copied = $state(false);

	let validation = $derived.by(() => {
		if (!rawJson.trim()) return null;
		return validateQuizData(rawJson);
	});

	let canImport = $derived(examName.trim().length > 0 && validation?.valid === true);

	const formatText = `{
  "Course Name": [
    {
      "id": "1",
      "question": "What is ...?",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
      "answer": "A. Option 1"
    }
  ]
}`;

	function validateQuizData(
		json: string
	):
		| { valid: true; data: QuizData; courses: number; questions: number }
		| { valid: false; error: string }
	{
		let parsed: unknown;
		try {
			parsed = JSON.parse(json);
		} catch {
			return { valid: false, error: 'Invalid JSON syntax.' };
		}

		if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
			return { valid: false, error: 'Root must be an object, e.g. { "Course Name": [...] }.' };
		}

		const data = parsed as Record<string, unknown>;
		const keys = Object.keys(data);
		if (keys.length === 0) {
			return { valid: false, error: 'At least one course is required.' };
		}

		let total = 0;
		for (const course of keys) {
			const questions = data[course];
			if (!Array.isArray(questions)) {
				return { valid: false, error: `"${course}" must be an array.` };
			}
			if (questions.length === 0) {
				return { valid: false, error: `"${course}" has no questions.` };
			}
			for (let i = 0; i < questions.length; i++) {
				const q = questions[i] as Partial<Question>;
				const idx = i + 1;
				if (!q.id || typeof q.id !== 'string')
					return { valid: false, error: `"${course}" question ${idx} is missing a valid "id".` };
				if (!q.question || typeof q.question !== 'string')
					return {
						valid: false,
						error: `"${course}" question ${idx} is missing a valid "question".`
					};
				if (!Array.isArray(q.options) || q.options.length === 0)
					return {
						valid: false,
						error: `"${course}" question ${idx} is missing valid "options".`
					};
				if (!q.answer || typeof q.answer !== 'string')
					return { valid: false, error: `"${course}" question ${idx} is missing a valid "answer".` };
				total++;
			}
		}

		return { valid: true, data: parsed as QuizData, courses: keys.length, questions: total };
	}

	function readFile(file: File) {
		// Check file size before reading
		if (file.size > MAX_FILE_SIZE) {
			const sizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
			toast.error('File too large', {
				description: `Maximum file size is ${sizeMB}MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`
			});
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			rawJson = reader.result as string;
		};
		reader.onerror = () => {
			toast.error('Failed to read file');
		};
		reader.readAsText(file);
	}

	function handleFileUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		if (!file.name.endsWith('.json')) {
			toast.error('Only .json files are supported');
			input.value = '';
			return;
		}
		readFile(file);
		input.value = '';
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
		const file = e.dataTransfer?.files?.[0];
		if (!file) return;
		if (!file.name.endsWith('.json')) {
			toast.error('Only .json files are supported');
			return;
		}
		readFile(file);
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		dragOver = true;
	}

	function handleDragLeave() {
		dragOver = false;
	}

	function handleCopy() {
		navigator.clipboard.writeText(formatText);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}

	function handleImport() {
		if (!canImport || !validation || !validation.valid) return;
		const key = `custom-${Date.now()}`;
		const stored = localStorage.getItem('exit-mock-custom-mocks');
		const existing: { key: string; label: string; data: QuizData }[] = stored
			? JSON.parse(stored)
			: [];
		existing.push({ key, label: examName.trim(), data: validation.data });

		// Use utility function to safely store with quota check
		const saved = tryLocalStorageSet('exit-mock-custom-mocks', existing);
		if (!saved) {
			toast.error('Storage quota exceeded', {
				description: 'Browser storage is full. Please delete some exams or clear browser data.'
			});
			return;
		}

		toast.success(
			`"${examName.trim()}" imported — ${validation.questions} questions across ${validation.courses} courses.`
		);
		open = false;
		rawJson = '';
		examName = '';
		onimport?.();
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger
		class="flex items-center gap-1 border p-2 text-sm text-muted-foreground hover:text-foreground"
	>
		Import New Exam
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>Import New Exam</Dialog.Title>
			<Dialog.Description>
				Upload a <code class="rounded bg-muted px-1">.json</code> file or paste its content below.
			</Dialog.Description>
		</Dialog.Header>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<!-- Left column: input -->
			<div class="space-y-4">
				<div class="space-y-1.5">
					<label class="text-sm font-medium" for="exam-name">Exam Name</label>
					<input
						id="exam-name"
						type="text"
						placeholder="My Exam"
						bind:value={examName}
						class="w-full rounded-md border bg-transparent px-3 py-1.5 text-sm outline-none
						ring-0 transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
					/>
				</div>

				<div class="space-y-1.5">
					<label class="text-sm font-medium" for="json-content">JSON Content</label>
					<div
						class="relative {dragOver
							? 'border-primary'
							: 'border-input'} rounded-md border-2 border-dashed transition-colors"
						role="button"
						tabindex="0"
						ondragover={handleDragOver}
						ondragleave={handleDragLeave}
						ondrop={handleDrop}
						onclick={() => fileInput?.click()}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') fileInput?.click();
						}}
					>
						<textarea
							id="json-content"
							placeholder="Paste your JSON here or drop a .json file..."
							class="min-h-[200px] w-full resize-y rounded-md bg-transparent p-3 font-mono text-xs outline-none placeholder:text-muted-foreground"
							bind:value={rawJson}
							onclick={(e) => e.stopPropagation()}
						></textarea>
						<input
							type="file"
							accept=".json"
							class="hidden"
							bind:this={fileInput}
							onchange={handleFileUpload}
						/>
					</div>
					<button
						class="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors hover:bg-muted"
						onclick={() => fileInput?.click()}
					>
						<Upload class="h-3.5 w-3.5" />
						Upload .json file
					</button>
				</div>

				{#if validation}
					{#if validation.valid}
						<p class="text-sm text-green-600">
							Valid — {validation.questions} questions across {validation.courses} courses.
						</p>
					{:else}
						<p class="text-sm text-destructive">{validation.error}</p>
					{/if}
				{/if}
			</div>

			<!-- Right column: format reference -->
			<div class="space-y-1.5">
				<span class="text-sm font-medium">Expected format</span>
				<div class="relative">
					<pre
						class="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs leading-relaxed"
					>{formatText}</pre>
					<button
						class="absolute top-1.5 right-1.5 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
						onclick={handleCopy}
					>
						{#if copied}
							<Check class="h-3.5 w-3.5 text-green-600" />
						{:else}
							<Copy class="h-3.5 w-3.5" />
						{/if}
					</button>
				</div>
			</div>
		</div>

		<Dialog.Footer>
			<Dialog.Close class="rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-muted">
				Cancel
			</Dialog.Close>
			<button
				class="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
				disabled={!canImport}
				onclick={handleImport}
			>
				Import
			</button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
