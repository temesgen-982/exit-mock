<script lang="ts">
	import type { QuizData } from '$lib/types';
	import QuizProgress from '$lib/components/QuizProgress.svelte';
	import QuizSidebar from '$lib/components/QuizSidebar.svelte';
	import QuizMain from '$lib/components/QuizMain.svelte';
	import QuizSummary from '$lib/components/QuizSummary.svelte';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import { toast } from 'svelte-sonner';
	import { normalizeAnswer, tryLocalStorageSet } from '$lib/utils';

	let { quizData, mockKey }: { quizData: QuizData; mockKey?: string } = $props();

	let sections = $derived(Object.keys(quizData));
	let selectedCourse = $state('');
	let currentIndex = $state(0);
	let answers = $state<Record<string, Record<number, string>>>({});
	let showSummary = $state(false);
	let autoCompleted = $state(false);
	let revealMode = $state('per-question');

	const isMobile = new IsMobile();
	let sidebarCollapsed = $state(isMobile.current);

	$effect(() => {
		if (!mockKey) {
			selectedCourse = sections[0] ?? '';
			return;
		}
		try {
			const saved = localStorage.getItem(`exit-mock-${mockKey}`);
			if (saved) {
				const parsed = JSON.parse(saved);
				if (parsed.answers) answers = parsed.answers;
			}
		} catch (error) {
			toast.error('Could not load quiz progress', {
				description: 'Your previous answers may be lost'
			});
		}
		try {
			const settings = localStorage.getItem('exit-mock-settings');
			if (settings) {
				const parsed = JSON.parse(settings);
				if (parsed.revealMode) revealMode = parsed.revealMode;
			}
		} catch (error) {
			toast.error('Could not load settings', {
				description: 'Using default reveal mode'
			});
		}
		selectedCourse = sections[0] ?? '';
		currentIndex = 0;
	});

	$effect(() => {
		if (!mockKey) return;
		const saved = tryLocalStorageSet(`exit-mock-${mockKey}`, { answers });
		if (!saved) {
			toast.error('Could not save progress', {
				description: 'Browser storage is full'
			});
		}
	});

	let activeQuestions = $derived(quizData[selectedCourse] ?? []);
	let courseComplete = $derived(
		activeQuestions.length > 0 &&
			activeQuestions.every((_, i) => (answers[selectedCourse] ?? {})[i] != null)
	);
	let revealed = $derived(
		revealMode === 'per-question' || (revealMode === 'per-course' && courseComplete)
	);
	let currentCourseIndex = $derived(sections.indexOf(selectedCourse));
	let isLastCourse = $derived(currentCourseIndex >= sections.length - 1);
	let currentAnswers = $derived(answers[selectedCourse] ?? {});
	let score = $derived(activeQuestions.filter((q, i) => currentAnswers[i] != null && normalizeAnswer(currentAnswers[i]) === normalizeAnswer(q.answer)).length);

	let allAnswered = $derived(
		sections.every((course) =>
			(quizData[course] ?? []).every((_, i) => (answers[course] ?? {})[i] != null)
		)
	);

	$effect(() => {
		if (allAnswered && !autoCompleted) {
			showSummary = true;
			autoCompleted = true;
		}
	});

	let courseStats = $derived(
		sections.map((course) => {
			const questions = quizData[course] ?? [];
			const courseAnswers = answers[course] ?? {};
			const answered = questions.filter((_, i) => courseAnswers[i] != null).length;
			const correct = questions.filter((q, i) => courseAnswers[i] != null && normalizeAnswer(courseAnswers[i]) === normalizeAnswer(q.answer)).length;
			return { course, total: questions.length, answered, correct };
		})
	);
	let totalQuestions = $derived(courseStats.reduce((sum, s) => sum + s.total, 0));
	let totalAnswered = $derived(courseStats.reduce((sum, s) => sum + s.answered, 0));
	let totalCorrect = $derived(courseStats.reduce((sum, s) => sum + s.correct, 0));
	let percentage = $derived(
		totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
	);
	let progressWidth = $derived(totalQuestions > 0 ? (totalAnswered / totalQuestions) * 100 : 0);

	function handleAnswerSelected(courseIndex: number, option: string) {
		answers = {
			...answers,
			[selectedCourse]: { ...(answers[selectedCourse] ?? {}), [courseIndex]: option }
		};
	}

	function handleNextQuestion() {
		const isLastQuestion = currentIndex >= activeQuestions.length - 1;
		if (isLastQuestion) {
			if (isLastCourse) {
				showSummary = true;
			} else {
				selectedCourse = sections[currentCourseIndex + 1];
				currentIndex = 0;
			}
		} else {
			currentIndex++;
		}
	}
</script>

<div class="col-span-12 flex min-h-0 flex-col">
	{#if showSummary}
		<QuizSummary
			{totalCorrect}
			{totalQuestions}
			{percentage}
			{courseStats}
			onreview={() => {
				showSummary = false;
			}}
			onbacktomocks={() => {
				window.location.href = '/';
			}}
		/>
	{:else}
		<QuizProgress {progressWidth} />

		<!-- Main area: sidebar + questions as a flex row -->
		<div class="flex min-h-0 flex-1">
			<QuizSidebar
				{sections}
				bind:selectedCourse
				bind:collapsed={sidebarCollapsed}
			/>

			<QuizMain
				{selectedCourse}
				{activeQuestions}
				bind:currentIndex
				{currentAnswers}
				{revealed}
				{score}
				{sections}
				onanswerselected={handleAnswerSelected}
				onsummary={() => {
					showSummary = true;
				}}
			/>
		</div>
	{/if}
</div>
