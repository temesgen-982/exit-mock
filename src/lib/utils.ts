import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

/**
 * Check if localStorage has enough space for the given data
 * @param dataSize - Size of data to store in bytes
 * @returns true if there's enough space, false otherwise
 */
export function hasLocalStorageSpace(dataSize: number = 0): boolean {
	try {
		// Try to estimate available space
		const test = '__ls_test__';
		const testSize = 1024 * 100; // 100KB test
		localStorage.setItem(test, 'x'.repeat(testSize));
		localStorage.removeItem(test);
		return true;
	} catch {
		return false;
	}
}

/**
 * Try to store data in localStorage and return whether it succeeded
 * @param key - localStorage key
 * @param value - JavaScript object to store (will be JSON stringified)
 * @returns true if successful, false if storage quota exceeded
 */
function decodeHtmlEntities(s: string): string {
	return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
}

export function normalizeAnswer(s: string): string {
	return decodeHtmlEntities(s).trim().replace(/\s+/g, ' ');
}

export function tryLocalStorageSet(key: string, value: unknown): boolean {
	try {
		localStorage.setItem(key, JSON.stringify(value));
		return true;
	} catch (error) {
		if (error instanceof Error && error.name === 'QuotaExceededError') {
			return false;
		}
		throw error;
	}
}
