import type { HashMap as HashMapType } from "../classes/HashMap";
import type { Iterator as IteratorType } from "../classes/Iterator";
import type { Option as OptionType } from "../classes/Option";
import type { Result as ResultType } from "../classes/Result";
import type { Vec as VecType } from "../classes/Vec";
import { lazyGet } from "../util/lazyLoad";
import { Range, resolveRange } from "../util/Range";
import { fixedSizeHint, SizeHint } from "../util/sizeHint";
import { unit, UnitType } from "../util/Unit";

let HashMap: typeof HashMapType;
lazyGet("HashMap", (c) => {
	HashMap = c;
});

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
