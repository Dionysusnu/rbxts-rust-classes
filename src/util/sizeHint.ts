import type { Iterator as IteratorType } from "../classes/Iterator";
import type { Option as OptionType } from "../classes/Option";
import type { Result as ResultType } from "../classes/Result";
import type { Vec as VecType } from "../classes/Vec";

import { lazyGet } from "../util/lazyLoad";
import { Range, resolveRange } from "../util/Range";
import { unit, UnitType } from "../util/Unit";


let Iterator: typeof IteratorType;
lazyGet("Iterator", (c) => {
	Iterator = c;
});

let Option: typeof OptionType;
lazyGet("Option", (c) => {
	Option = c;
});

let Result: typeof ResultType;
lazyGet("Result", (c) => {
	Result = c;
});

let Vec: typeof VecType;
lazyGet("Vec", (c) => {
	Vec = c;
});

export type SizeHint = LuaTuple<[number, OptionType<number>]>;
export function fixedSizeHint(fixed: number) {
	return (): SizeHint => [fixed, Option.some(fixed)] as SizeHint;
}
export function upperSizeHint(upper: number) {
	return (): SizeHint => [0, Option.some(upper)] as SizeHint;
}
export function lowerSizeHint(lower: number) {
	return (): SizeHint => [lower, Option.none()] as SizeHint;
}
