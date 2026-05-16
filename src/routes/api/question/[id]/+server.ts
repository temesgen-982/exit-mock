import { json } from '@sveltejs/kit';
import mock1 from '$lib/data/mock1.json';
import mock2 from '$lib/data/mock2.json';
import type { QuizData } from '$lib/types';

export const prerender = true;

export function entries() {
	const mocks = [mock1, mock2] as QuizData[];
	const ids = new Set<string>();
	for (const mock of mocks) {
		for (const questions of Object.values(mock)) {
			for (const q of questions) {
				ids.add(q.id);
			}
		}
	}
	return [...ids].map((id) => ({ id }));
}

export function GET({ params }) {
	const mocks = [mock1, mock2] as QuizData[];
	for (const mock of mocks) {
		for (const questions of Object.values(mock)) {
			const found = questions.find((q) => q.id === params.id);
			if (found) return json(found);
		}
	}
	return json(null, { status: 404 });
}
