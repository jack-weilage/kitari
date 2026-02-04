import type { OnStart, StoreGet, Subscriber, Unsubscriber } from "./types";
import { writable } from "./writable";

/** Readable interface for subscribing. */
export interface Readable<T> {
	/**
	 * Get the current value.
	 */
	get: StoreGet<T>;
	/**
	 * Subscribe to value changes.
	 *
	 * @param run Subscription callback
	 */
	subscribe: (run: Subscriber<T>) => Unsubscriber;
}

/**
 * Derives a readable store from an existing one.
 *
 * @param store Store to make readonly
 */
export function readonly<T>(store: Readable<T>): Readable<T> {
	const { get, subscribe } = store;

	return { get, subscribe };
}

/**
 * Creates a `Readable` store that allows reading by subscription or direct access.
 *
 * @param value Initial value
 * @param onStart First subscription callback
 */
export function readable<T>(value: T, onStart?: OnStart<T>): Readable<T> {
	const { get, subscribe } = writable(value, onStart);

	return { get, subscribe };
}
