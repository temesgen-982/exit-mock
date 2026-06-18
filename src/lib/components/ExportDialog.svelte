<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import type { QuizData, Question } from '$lib/types';
	import Download from '@lucide/svelte/icons/download';
	import Check from '@lucide/svelte/icons/check';
	import { toast } from 'svelte-sonner';

	let {
		quizData
	}: {
		quizData?: QuizData | null;
	} = $props();

	let open = $state(false);
	let copied = $state(false);

	interface QuizProgress {
		mockKey: string;
		answers: Record<string, Record<number, string>>;
	}

	interface ExportedQuestion {
		id: string;
		question: string;
		options: string[];
		userAnswer: string | null;
		correctAnswer: string;
		isCorrect: boolean;
	}

	interface ExportedCourse {
		course: string;
		questions: ExportedQuestion[];
	}

	interface ExportedProgress {
		mockKey: string;
		courses: ExportedCourse[];
	}

	function enrichProgress(progress: QuizProgress[]): ExportedProgress[] {
		if (!quizData) {
			return progress.map((p) => ({ mockKey: p.mockKey, courses: [] }));
		}
		return progress.map((p) => {
			const courses: ExportedCourse[] = [];
			for (const courseName in quizData) {
				const questions = quizData[courseName];
				const courseAnswers = p.answers[courseName] ?? {};
				const questionList: ExportedQuestion[] = questions.map((q, i) => ({
					id: q.id,
					question: q.question,
					options: [...q.options],
					userAnswer: courseAnswers[i] ?? null,
					correctAnswer: q.answer,
					isCorrect: courseAnswers[i] != null && courseAnswers[i] === q.answer
				}));
				if (questionList.some((q) => q.userAnswer != null)) {
					courses.push({ course: courseName, questions: questionList });
				}
			}
			return { mockKey: p.mockKey, courses };
		});
	}

	function buildExportData() {
		const rawProgress = getQuizProgress();
		return {
			version: 2,
			exportedAt: new Date().toISOString(),
			quizProgress: enrichProgress(rawProgress),
			customExams: getCustomExams(),
			settings: getSettings()
		};
	}

	function exportAllData() {
		try {
			const data = buildExportData();
			const json = JSON.stringify(data, null, 2);
			downloadFile(json, `exit-mock-backup-${new Date().toISOString().split('T')[0]}.json`);
			toast.success('Data exported successfully');
			open = false;
		} catch (error) {
			toast.error('Failed to export data', {
				description: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	function getQuizProgress(): QuizProgress[] {
		try {
			const progress: QuizProgress[] = [];
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key?.startsWith('exit-mock-') && !key.includes('custom') && !key.includes('settings')) {
					const mockKey = key.replace('exit-mock-', '');
					const data = localStorage.getItem(key);
					if (data) {
						const parsed = JSON.parse(data);
						progress.push({ mockKey, answers: parsed.answers || {} });
					}
				}
			}
			return progress;
		} catch {
			return [];
		}
	}

	function getCustomExams() {
		try {
			const stored = localStorage.getItem('exit-mock-custom-mocks');
			return stored ? JSON.parse(stored) : [];
		} catch {
			return [];
		}
	}

	function getSettings() {
		try {
			const stored = localStorage.getItem('exit-mock-settings');
			return stored ? JSON.parse(stored) : {};
		} catch {
			return {};
		}
	}

	function downloadFile(content: string, filename: string) {
		const blob = new Blob([content], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}

	function copyToClipboard() {
		try {
			const data = buildExportData();
			const json = JSON.stringify(data, null, 2);
			navigator.clipboard.writeText(json);
			copied = true;
			toast.success('Copied to clipboard');
			setTimeout(() => (copied = false), 1500);
		} catch (error) {
			toast.error('Failed to copy', {
				description: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}
</script>

{#if quizData}
	<!-- detail available -- show enriched info -->
	<p class="sr-only">Quiz data loaded — export includes full question details</p>
{/if}

<Dialog.Root bind:open>
	<Dialog.Trigger
		class="flex items-center gap-1 border p-2 text-sm text-muted-foreground hover:text-foreground"
		title="Export quiz progress and custom exams"
		aria-label="Open export dialog to download or copy your data"
	>
		<Download class="h-4 w-4" />
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Export Your Data</Dialog.Title>
			<Dialog.Description>
				Download or copy all your quiz progress and custom exams.
				{#if quizData}
					Includes full question text, your answers, and correct answers.
				{:else}
					This includes all answers and settings.
				{/if}
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<div class="rounded-lg bg-muted p-4">
				<p class="text-sm text-muted-foreground">
					Your backup includes:
				</p>
				<ul class="mt-2 space-y-1 text-xs text-muted-foreground">
					<li>✓ {quizData ? 'Full question text with your answers and correct answers' : 'Quiz progress and answers'}</li>
					<li>✓ All custom exams</li>
					<li>✓ Settings and preferences</li>
				</ul>
			</div>

			<div class="flex gap-2">
				<button
					class="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
					onclick={exportAllData}
				>
					<Download class="h-4 w-4" />
					Download
				</button>
				<button
					class="flex-1 flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted"
					onclick={copyToClipboard}
				>
					{#if copied}
						<Check class="h-4 w-4 text-green-600" />
						Copied
					{:else}
						Copy to Clipboard
					{/if}
				</button>
			</div>
		</div>

		<Dialog.Footer>
			<Dialog.Close class="rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-muted">
				Close
			</Dialog.Close>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
