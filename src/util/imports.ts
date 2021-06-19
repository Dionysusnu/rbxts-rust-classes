import type { Iterator as IteratorType } from "../classes/Iterator";
import type { Option as OptionType } from "../classes/Option";
import type { Result as ResultType } from "../classes/Result";
import type { Vec as VecType } from "../classes/Vec";

import { lazyGet } from "../util/lazyLoad";
import { Range, resolveRange } from "../util/Range";
import { unit, UnitType } from "../util/Unit";

declare let Iterator: typeof IteratorType;
lazyGet("Iterator", (c) => {
	Iterator = c;
});

declare let Option: typeof OptionType;
lazyGet("Option", (c) => {
	Option = c;
});

declare let Result: typeof ResultType;
lazyGet("Result", (c) => {
	Result = c;
});

declare let Vec: typeof VecType;
lazyGet("Vec", (c) => {
	Vec = c;
});
