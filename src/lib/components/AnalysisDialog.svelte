<script lang="ts">
	import FileChartColumn from '@lucide/svelte/icons/file-chart-column';
	import Trophy from '@lucide/svelte/icons/trophy';
	import Target from '@lucide/svelte/icons/target';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import mock1 from '$lib/data/mock1.json';
	import mock2 from '$lib/data/mock2.json';
	import type { QuizData } from '$lib/types';

	type MockKey = 'all' | 'mock1' | 'mock2';
	type MockStat = { key: MockKey; total: number; correct: number; percentage: number };
	type CourseStat = { name: string; total: number; correct: number; percentage: number };

	let open = $state(false);
	let selectedView = $state<MockKey>('all');
	let mockResults = $state<MockStat[]>([]);
	let allCourses = $state<CourseStat[]>([]);
	let mock1Courses = $state<CourseStat[]>([]);
	let mock2Courses = $state<CourseStat[]>([]);

	$effect(() => {
		if (!open) return;
		computeStats();
	});

	function computeStats() {
		const mocks: Record<string, QuizData> = {
			mock1: mock1 as QuizData,
			mock2: mock2 as QuizData
		};

		const allCourseMap = new Map<string, number[]>();
		const mock1CourseMap = new Map<string, number[]>();
		const mock2CourseMap = new Map<string, number[]>();

		function processMock(key: string, quizData: QuizData, courseMap: Map<string, number[]>) {
			const saved = localStorage.getItem(`exit-mock-${key}`);
			let answers: Record<string, Record<number, string>> = {};
			if (saved) {
				try { const p = JSON.parse(saved); if (p.answers) answers = p.answers; } catch { /* */ }
			}

			let total = 0;
			let correct = 0;

			for (const [course, questions] of Object.entries(quizData)) {
				const courseAnswers = answers[course] ?? {};
				const scores: number[] = [];
				for (let i = 0; i < questions.length; i++) {
					total++;
					const ans = courseAnswers[i];
					if (ans != null) {
						scores.push(ans === questions[i].answer ? 1 : 0);
						if (ans === questions[i].answer) correct++;
					} else {
						scores.push(-1);
					}
				}
				courseMap.set(course, scores);
				const existing = allCourseMap.get(course) ?? [];
				existing.push(...scores);
				allCourseMap.set(course, existing);
			}

			return { total, correct, percentage: total > 0 ? Math.round((correct / total) * 100) : 0 };
		}

		const m1 = processMock('mock1', mocks.mock1, mock1CourseMap);
		const m2 = processMock('mock2', mocks.mock2, mock2CourseMap);

		function toCourseStats(map: Map<string, number[]>): CourseStat[] {
			return [...map.entries()]
				.map(([name, scores]) => {
					const total = scores.length;
					const correct = scores.filter((s) => s === 1).length;
					return {
						name,
						total,
						correct,
						percentage: total > 0 ? Math.round((correct / total) * 100) : 0
					};
				})
				.sort((a, b) => a.percentage - b.percentage);
		}

		selectedView = 'all';
		mockResults = [
			{ key: 'mock1', ...m1 },
			{ key: 'mock2', ...m2 }
		];
		mock1Courses = toCourseStats(mock1CourseMap);
		mock2Courses = toCourseStats(mock2CourseMap);
		allCourses = toCourseStats(allCourseMap);
	}

	let displayStats = $derived.by<(MockStat & { courses: CourseStat[] }) | null>(() => {
		if (mockResults.length === 0) return null;
		if (selectedView === 'all') {
			const total = mockResults.reduce((s, m) => s + m.total, 0);
			const correct = mockResults.reduce((s, m) => s + m.correct, 0);
			return {
				key: 'all' as MockKey,
				total,
				correct,
				percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
				courses: allCourses
			};
		}
		const mock = mockResults.find((m) => m.key === selectedView);
		if (!mock) return null;
		return {
			...mock,
			courses: selectedView === 'mock1' ? mock1Courses : mock2Courses
		};
	});
</script>

<Dialog.Root bind:open={open}>
	<Dialog.Trigger
		class="flex items-center gap-1 border p-2 text-sm text-muted-foreground hover:text-foreground"
	>
		<FileChartColumn /> Analysis
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title>Analysis</Dialog.Title>
			<Dialog.Description>
				Track your progress and identify areas for improvement.
			</Dialog.Description>
		</Dialog.Header>

		{#if displayStats}
			<div class="max-h-96 space-y-5 overflow-y-auto pr-1">
				<!-- Mock selector -->
				<div class="grid grid-cols-3 gap-2">
					<button
						class="rounded-lg border p-3 text-left transition-colors
							{selectedView === 'all'
								? 'border-primary bg-primary/5'
								: 'hover:bg-muted'}"
						onclick={() => { selectedView = 'all'; }}
					>
						<p class="text-sm font-medium">All</p>
						<p class="text-xs text-muted-foreground">
							{displayStats.correct}/{displayStats.total}
						</p>
					</button>
					{#each mockResults as mock}
						<button
							class="rounded-lg border p-3 text-left transition-colors
								{selectedView === mock.key
									? 'border-primary bg-primary/5'
									: 'hover:bg-muted'}"
							onclick={() => { selectedView = mock.key; }}
						>
							<p class="text-sm font-medium capitalize">{mock.key}</p>
							<p class="text-xs text-muted-foreground">
								{mock.correct}/{mock.total}
							</p>
						</button>
					{/each}
				</div>

				<!-- Overall -->
				<div class="flex items-center gap-3 rounded-lg border p-4">
					<Target class="h-8 w-8 shrink-0 text-primary" />
					<div>
						<p class="text-sm font-medium">
							{displayStats.correct}/{displayStats.total} correct
						</p>
						<p class="text-xs text-muted-foreground">{displayStats.percentage}%</p>
					</div>
				</div>

				<!-- Weakest courses -->
				<div>
					<div class="mb-2 flex items-center gap-1.5">
						<Trophy class="h-4 w-4 text-muted-foreground" />
						<p class="text-xs font-medium text-muted-foreground">Weakest Courses</p>
					</div>
					<div class="space-y-1">
						{#each displayStats.courses as course}
							<div class="flex items-center justify-between rounded px-2 py-1 hover:bg-muted">
								<span class="truncate text-sm">{course.name}</span>
								<span class="shrink-0 text-xs tabular-nums text-muted-foreground">
									{course.correct}/{course.total}
								</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{:else}
			<p class="py-6 text-center text-sm text-muted-foreground">
				No data yet. Start a mock exam to see your analysis.
			</p>
		{/if}
	</Dialog.Content>
</Dialog.Root>
