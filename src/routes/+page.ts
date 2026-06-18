export const prerender = true;

import mock1 from '$lib/data/mock1.json';
import mock2 from '$lib/data/mock2.json';
import uogMock from '$lib/data/uog-mock.json';
import modelExam1 from '$lib/data/model-exam-1.json';
import modelExam2 from '$lib/data/model-exam-2.json';
import modelExamPhase1 from '$lib/data/model-exam-phase1.json';
import haumock from '$lib/data/hau-mock.json';
import haumock2 from '$lib/data/hau-mock2.json';
import type { QuizData, MockMeta } from '$lib/types';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
	return {
		mocks: {
			mock1: mock1 as QuizData,
			mock2: mock2 as QuizData,
			'uog-mock': uogMock as QuizData,
			'model-exam-1': modelExam1 as QuizData,
			'model-exam-2': modelExam2 as QuizData,
			'model-exam-phase1': modelExamPhase1 as QuizData,
			'hau-mock': haumock as QuizData,
			'hau-mock2': haumock2 as QuizData
		},
		mockMeta: [
			{ key: 'mock1', label: 'Mock 1', source: 'builtin' },
			{ key: 'mock2', label: 'Mock 2', source: 'builtin' },
			{ key: 'uog-mock', label: 'UOG Mock', source: 'builtin' },
			{ key: 'model-exam-1', label: 'Model Exam 1', source: 'builtin' },
			{ key: 'model-exam-2', label: 'Model Exam 2', source: 'builtin' },
			{ key: 'model-exam-phase1', label: 'Model Exam Phase 1', source: 'builtin' },
			{ key: 'hau-mock', label: 'HAU Mock', source: 'builtin' },
			{ key: 'hau-mock2', label: 'HAU Mock 2', source: 'builtin' }
		]
	} as { mocks: Record<string, QuizData>; mockMeta: MockMeta[] };
};
