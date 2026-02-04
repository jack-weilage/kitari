import { describe, expect, mock, test } from "bun:test";
import { readable, readonly } from "./readable";
import { writable } from "./writable";

describe("readable", () => {
	test("exposes get and subscribe but not set or update", () => {
		const store = readable(0);

		expect(store.get).toBeFunction();
		expect(store.subscribe).toBeFunction();
		expect(store).not.toHaveProperty("set");
		expect(store).not.toHaveProperty("update");
	});

	test("get returns initial value", () => {
		const store = readable(99);

		expect(store.get()).toBe(99);
	});

	test("value can be controlled via onStart set", () => {
		const store = readable(0, (set) => set(100));
		const values: number[] = [];
		store.subscribe((v) => values.push(v));

		expect(values).toEqual([100]);
	});

	test("value can be controlled via onStart update", () => {
		const store = readable(10, (_set, update) => update((n) => n + 5));
		const values: number[] = [];

		store.subscribe((v) => values.push(v));

		expect(values).toEqual([15]);
	});

	test("onStop teardown is called when last subscriber leaves", () => {
		const stop = mock();
		const store = readable(0, () => stop);

		const unsub = store.subscribe(() => {});
		unsub();

		expect(stop).toHaveBeenCalledTimes(1);
	});
});

describe("writableToReadable", () => {
	test("exposes only get and subscribe", () => {
		const store = readonly(writable(0));

		expect(store.get).toBeFunction();
		expect(store.subscribe).toBeFunction();
		expect(store).not.toHaveProperty("set");
		expect(store).not.toHaveProperty("update");
	});

	test("reflects changes from the underlying writable", () => {
		const w = writable(0);
		const r = readonly(w);

		w.set(42);

		expect(r.get()).toBe(42);
	});

	test("subscribers receive updates from the underlying writable", () => {
		const w = writable(0);
		const r = readonly(w);
		const values: number[] = [];

		r.subscribe((v) => values.push(v));
		w.set(1);
		w.set(2);

		expect(values).toEqual([0, 1, 2]);
	});
});
