export const prerender = 'auto';

import mock1 from '$lib/data/mock1.json';
import mock2 from '$lib/data/mock2.json';
import uogMock from '$lib/data/uog-mock.json';
import modelExam1 from '$lib/data/model-exam-1.json';
import modelExam2 from '$lib/data/model-exam-2.json';
import modelExamPhase1 from '$lib/data/model-exam-phase1.json';
import type { QuizData, MockMeta } from '$lib/types';
import type { PageLoad } from './$types';

export function entries() {
	return [
		{ mock: 'mock1' },
		{ mock: 'mock2' },
		{ mock: 'uog-mock' },
		{ mock: 'model-exam-1' },
		{ mock: 'model-exam-2' },
		{ mock: 'model-exam-phase1' }
	];
}

export const load: PageLoad = ({ params }) => {
	const builtIn: Record<string, QuizData> = {
		mock1: mock1 as QuizData,
		mock2: mock2 as QuizData,
		'uog-mock': uogMock as QuizData,
		'model-exam-1': modelExam1 as QuizData,
		'model-exam-2': modelExam2 as QuizData,
		'model-exam-phase1': modelExamPhase1 as QuizData
	};

	if (params.mock in builtIn) {
		return { quizData: builtIn[params.mock], mockKey: params.mock };
	}

	// Client-side only: try to load custom mock from localStorage
	try {
		if (typeof localStorage !== 'undefined') {
			const stored = localStorage.getItem('exit-mock-custom-mocks');
			if (stored) {
				const mocks: { key: string; label: string; data: QuizData }[] = JSON.parse(stored);
				const mock = mocks.find((m) => m.key === params.mock);
				if (mock) return { quizData: mock.data, mockKey: params.mock };
			}
		}
	} catch {
		/* ignore */
	}

	return { quizData: null, mockKey: params.mock };
};
