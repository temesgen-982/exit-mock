import { json } from '@sveltejs/kit';
import mock1 from '$lib/data/mock1.json';
import mock2 from '$lib/data/mock2.json';
import uogMock from '$lib/data/uog-mock.json';
import modelExam1 from '$lib/data/model-exam-1.json';
import modelExam2 from '$lib/data/model-exam-2.json';
import modelExamPhase1 from '$lib/data/model-exam-phase1.json';
import type { QuizData } from '$lib/types';

export const prerender = true;

const allMocks = [mock1, mock2, uogMock, modelExam1, modelExam2, modelExamPhase1] as QuizData[];

export function entries() {
	const ids = new Set<string>();
	for (const mock of allMocks) {
		for (const questions of Object.values(mock)) {
			for (const q of questions) {
				ids.add(q.id);
			}
		}
	}
	return [...ids].map((id) => ({ id }));
}

export function GET({ params }) {
	for (const mock of allMocks) {
		for (const questions of Object.values(mock)) {
			const found = questions.find((q) => q.id === params.id);
			if (found) return json(found);
		}
	}
	return json(null, { status: 404 });
}
