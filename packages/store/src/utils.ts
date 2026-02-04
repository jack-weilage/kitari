export function safeNotEqual(a: unknown, b: unknown) {
	// biome-ignore lint/suspicious/noSelfCompare: We're explicitly checking for NaN
	return a !== a
		? // biome-ignore lint/suspicious/noSelfCompare: We're explicitly checking for NaN
			b === b
		: a !== b || (a && typeof a === "object") || typeof a === "function";
}
