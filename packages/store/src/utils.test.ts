import { describe, expect, test } from "bun:test";
import { safeNotEqual } from "./utils";

describe("safeNotEqual", () => {
	test("returns false for equal primitives", () => {
		expect(safeNotEqual(1, 1)).toBeFalse();
		expect(safeNotEqual("a", "a")).toBeFalse();
		expect(safeNotEqual(true, true)).toBeFalse();
		expect(safeNotEqual(null, null)).toBeFalse();
		expect(safeNotEqual(undefined, undefined)).toBeFalse();
	});

	test("returns true for different primitives", () => {
		expect(safeNotEqual(1, 2)).toBeTrue();
		expect(safeNotEqual("a", "b")).toBeTrue();
		expect(safeNotEqual(true, false)).toBeTrue();
	});

	test("returns false for NaN compared to NaN", () => {
		expect(safeNotEqual(NaN, NaN)).toBeFalse();
	});

	test("returns true for same object reference", () => {
		const obj = { a: 1 };
		expect(safeNotEqual(obj, obj)).toBeTrue();
	});

	test("returns true for same function reference", () => {
		const fn = () => {};
		expect(safeNotEqual(fn, fn)).toBeTrue();
	});

	test("returns true for different objects", () => {
		expect(safeNotEqual({ a: 1 }, { a: 1 })).toBeTrue();
	});
});
