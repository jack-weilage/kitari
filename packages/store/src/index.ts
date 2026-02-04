import type { StoreSet, StoreUpdate } from "./writable";

/** Callback to inform of value updates. */
export type Subscriber<T> = (value: T) => void;
/** Unsubscribes from value updates. */
export type Unsubscriber = () => void;
/** Callback to update a value. */
export type Updater<T> = (value: T) => T;

/**
 * Start notification callback, called when the first subscriber subscribes.
 *
 * @param set Function that sets the value of the store.
 * @param update Function that sets the value using a callback.
 *
 * @returns An optional callback function called after the last subscriber unsubscribes.
 */
export type OnStart<T> = (
	set: StoreSet<T>,
	update: StoreUpdate<T>,
	// biome-ignore lint/suspicious/noConfusingVoidType: void is the correct type here
) => (() => void) | void;

export type { Readable } from "./readable";
export { readable, readonly } from "./readable";

export type { Writable } from "./writable";
export { writable } from "./writable";
