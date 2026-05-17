export interface Question {
	id: string;
	question: string;
	options: string[];
	answer: string;
}

export type QuizData = Record<string, Question[]>;

export interface MockMeta {
	key: string;
	label: string;
	source?: 'builtin' | 'custom';
}
