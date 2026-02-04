import type { Readable } from "./readable";
import type { OnStart, StoreGet, StoreSet, StoreSubscribe, StoreUpdate, Subscriber } from "./types";
import { safeNotEqual } from "./utils";

/** Writable interface for both updating and subscribing. */
export interface Writable<T> extends Readable<T> {
	/**
	 * Set value and inform subscribers.
	 */
	set: StoreSet<T>;
	/**
	 * Update value using callback and inform subscribers.
	 */
	update: StoreUpdate<T>;
}

/**
 * Create a `Writable` store that allows both updating and reading by subscription or direct access.
 *
 * @param value Initial value
 * @param onStart First subscription callback
 */
export function writable<T>(value: T, onStart?: OnStart<T>): Writable<T> {
	let internalValue = value;
	let onStop: (() => void) | undefined;
	const subscribers = new Set<Subscriber<T>>();

	const get: StoreGet<T> = () => internalValue;
	const set: StoreSet<T> = (newValue) => {
		if (!safeNotEqual(internalValue, newValue)) return;

		internalValue = newValue;

		if (subscribers.size === 0) return;

		for (const subscriber of subscribers) {
			subscriber(internalValue);
		}
	};
	const update: StoreUpdate<T> = (updater) => set(updater(internalValue));
	const subscribe: StoreSubscribe<T> = (subscriber) => {
		subscribers.add(subscriber);

		if (subscribers.size === 1) {
			// TODO: The ?? undefined is only used to convert `void` to `undefined`.
			onStop = onStart?.(set, update) ?? undefined;
		}

		subscriber(internalValue);

		return () => {
			subscribers.delete(subscriber);

			if (subscribers.size === 0) {
				onStop?.();
				onStop = undefined;
			}
		};
	};

	return { get, set, update, subscribe };
}
