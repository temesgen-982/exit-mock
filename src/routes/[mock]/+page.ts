export const prerender = true;

import mock1 from '$lib/data/mock1.json';
import mock2 from '$lib/data/mock2.json';
import type { QuizData } from '$lib/types';
import type { PageLoad } from './$types';

export function entries() {
	return [{ mock: 'mock1' }, { mock: 'mock2' }];
}

export const load: PageLoad = ({ params }) => {
	const mocks: Record<string, QuizData> = {
		mock1: mock1 as QuizData,
		mock2: mock2 as QuizData
	};
	return { quizData: mocks[params.mock], mockKey: params.mock };
};
