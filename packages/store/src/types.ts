/** Callback to inform of value updates. */
export type Subscriber<T> = (value: T) => void;
/** Unsubscribes from value updates. */
export type Unsubscriber = () => void;
/** Callback to update a value. */
export type Updater<T> = (value: T) => T;

export type StoreGet<T> = () => T;
export type StoreSet<T> = (newValue: T) => void;
export type StoreUpdate<T> = (fn: Updater<T>) => void;
export type StoreSubscribe<T> = (subscriber: Subscriber<T>) => Unsubscriber;

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
