export const prerender = true;

import mock1 from '$lib/data/mock1.json';
import mock2 from '$lib/data/mock2.json';
import type { QuizData, MockMeta } from '$lib/types';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
	return {
		mocks: { mock1: mock1 as QuizData, mock2: mock2 as QuizData },
		mockMeta: [
			{ key: 'mock1', label: 'Mock 1' },
			{ key: 'mock2', label: 'Mock 2' }
		]
	} as { mocks: Record<string, QuizData>; mockMeta: MockMeta[] };
};
