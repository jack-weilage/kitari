import { describe, expect, mock, test } from "bun:test";
import { writable } from "./writable";

describe("writable", () => {
	test("get returns initial value", () => {
		const store = writable(42);

		expect(store.get()).toBe(42);
	});

	test("set updates value", () => {
		const store = writable(0);

		store.set(10);

		expect(store.get()).toBe(10);
	});

	test("update applies function to current value", () => {
		const store = writable(5);

		store.update((n) => n * 2);

		expect(store.get()).toBe(10);
	});

	test("subscribe calls subscriber immediately with current value", () => {
		const store = writable(7);
		const subscriber = mock();

		store.subscribe(subscriber);

		expect(subscriber).toHaveBeenCalledTimes(1);
		expect(subscriber).toHaveBeenCalledWith(7);
	});

	test("subscribe notifies on set", () => {
		const store = writable(0);
		const values: number[] = [];

		store.subscribe((v) => values.push(v));
		store.set(1);
		store.set(2);

		expect(values).toEqual([0, 1, 2]);
	});

	test("subscribe notifies on update", () => {
		const store = writable(1);
		const values: number[] = [];

		store.subscribe((v) => values.push(v));
		store.update((n) => n + 1);

		expect(values).toEqual([1, 2]);
	});

	test("set does not notify when value is equal", () => {
		const store = writable(5);
		const subscriber = mock();

		store.subscribe(subscriber);
		subscriber.mockClear();
		store.set(5);

		expect(subscriber).not.toHaveBeenCalled();
	});

	test("set always notifies for objects", () => {
		const obj = { a: 1 };
		const store = writable(obj);
		const subscriber = mock();

		store.subscribe(subscriber);
		subscriber.mockClear();
		store.set(obj);

		expect(subscriber).toHaveBeenCalledTimes(1);
	});

	test("set handles NaN correctly", () => {
		const store = writable(NaN);
		const subscriber = mock();

		store.subscribe(subscriber);
		subscriber.mockClear();
		store.set(NaN);

		expect(subscriber).not.toHaveBeenCalled();
	});

	test("unsubscribe stops notifications", () => {
		const store = writable(0);
		const subscriber = mock();

		const unsub = store.subscribe(subscriber);
		subscriber.mockClear();
		unsub();
		store.set(1);

		expect(subscriber).not.toHaveBeenCalled();
	});

	test("multiple subscribers all receive updates", () => {
		const store = writable(0);
		const a = mock();
		const b = mock();

		store.subscribe(a);
		store.subscribe(b);
		a.mockClear();
		b.mockClear();
		store.set(1);

		expect(a).toHaveBeenCalledWith(1);
		expect(b).toHaveBeenCalledWith(1);
	});

	test("unsubscribing one does not affect the other", () => {
		const store = writable(0);
		const a = mock();
		const b = mock();

		const unsubA = store.subscribe(a);
		store.subscribe(b);
		a.mockClear();
		b.mockClear();
		unsubA();
		store.set(1);

		expect(a).not.toHaveBeenCalled();
		expect(b).toHaveBeenCalledWith(1);
	});

	test("onFirstSubscriber is called on first subscribe", () => {
		const onFirst = mock();

		const store = writable(0, onFirst);
		expect(onFirst).not.toHaveBeenCalled();

		store.subscribe(() => {});
		expect(onFirst).toHaveBeenCalledTimes(1);
	});

	test("onFirstSubscriber is not called on subsequent subscribes", () => {
		const onFirst = mock();
		const store = writable(0, onFirst);

		store.subscribe(() => {});
		store.subscribe(() => {});

		expect(onFirst).toHaveBeenCalledTimes(1);
	});

	test("onFirstSubscriber receives set and update", () => {
		const store = writable(0, (set, update) => {
			set(10);
			update((n) => n + 5);
		});
		const values: number[] = [];

		store.subscribe((v) => values.push(v));

		expect(values).toEqual([15]);
	});

	test("onStop is called when last subscriber unsubscribes", () => {
		const stop = mock();
		const store = writable(0, () => stop);

		const unsub = store.subscribe(() => {});
		expect(stop).not.toHaveBeenCalled();

		unsub();
		expect(stop).toHaveBeenCalledTimes(1);
	});

	test("onStop is not called until all subscribers leave", () => {
		const stop = mock();
		const store = writable(0, () => stop);

		const unsub1 = store.subscribe(() => {});
		const unsub2 = store.subscribe(() => {});

		unsub1();
		expect(stop).not.toHaveBeenCalled();
		unsub2();
		expect(stop).toHaveBeenCalledTimes(1);
	});

	test("onFirstSubscriber is not re-invoked when going from 2 to 1 subscribers", () => {
		const onFirst = mock();
		const store = writable(0, onFirst);

		const unsub1 = store.subscribe(() => {});
		store.subscribe(() => {});

		expect(onFirst).toHaveBeenCalledTimes(1);
		unsub1();
		expect(onFirst).toHaveBeenCalledTimes(1);
	});

	test("onFirstSubscriber is re-invoked after all unsubscribe and resubscribe", () => {
		const stop = mock();
		const onFirst = mock(() => stop);
		const store = writable(0, onFirst);

		const unsub = store.subscribe(() => {});
		expect(onFirst).toHaveBeenCalledTimes(1);
		unsub();
		expect(stop).toHaveBeenCalledTimes(1);

		store.subscribe(() => {});
		expect(onFirst).toHaveBeenCalledTimes(2);
	});

	test("synchronous set in onFirstSubscriber notifies subscribers", () => {
		const store = writable(0, (set) => set(42));
		const values: number[] = [];
		store.subscribe((v) => values.push(v));

		expect(values).toEqual([42]);
	});

	test("set without subscribers updates value silently", () => {
		const subscriber = mock();
		const store = writable(0);

		store.set(5);
		store.subscribe(subscriber);

		expect(subscriber).toHaveBeenCalledWith(5);
		expect(subscriber).toHaveBeenCalledTimes(1);
	});

	test("subscriber can unsubscribe another during notification", () => {
		const store = writable(0);
		const calls: string[] = [];

		const unsub = store.subscribe(() => calls.push("a"));
		store.subscribe((v) => {
			calls.push("b");
			if (v === 1) unsub();
		});
		store.subscribe(() => calls.push("c"));

		calls.length = 0;
		store.set(1);

		expect(calls).toEqual(["a", "b", "c"]);

		calls.length = 0;
		store.set(2);

		expect(calls).toEqual(["b", "c"]);
	});

	test("re-entrant set() during notification calls subscribers in nested order", () => {
		const store = writable(0);
		const calls: number[] = [];

		store.subscribe((v) => {
			calls.push(v);
			if (v === 1) store.set(2);
		});

		store.set(1);

		expect(calls).toEqual([0, 1, 2]);
	});

	test("re-entrant set() with multiple subscribers causes nested notification", () => {
		const store = writable(0);
		const calls: string[] = [];

		store.subscribe((v) => {
			calls.push(`a:${v}`);
			if (v === 1) store.set(2);
		});
		store.subscribe((v) => calls.push(`b:${v}`));

		calls.length = 0;
		store.set(1);

		expect(calls).toEqual(["a:1", "a:2", "b:2", "b:2"]);
	});

	test("re-entrant set() does not cause infinite recursion with guard", () => {
		const store = writable(0);
		let count = 0;

		store.subscribe((v) => {
			count++;
			if (count < 10 && v < 5) store.set(v + 1);
		});

		store.set(1);

		expect(store.get()).toBe(4);
		expect(count).toBe(10);
	});

	test("re-entrant update() during notification works correctly", () => {
		const store = writable(0);
		const calls: number[] = [];

		store.subscribe((v) => {
			calls.push(v);
			if (v === 1) store.update((n) => n + 10);
		});

		store.set(1);

		expect(calls).toEqual([0, 1, 11]);
		expect(store.get()).toBe(11);
	});
});
