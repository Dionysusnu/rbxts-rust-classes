import { lazyRegister } from "./util/lazyLoad";

import { Iterator } from "./classes/Iterator";
lazyRegister("Iterator", Iterator);

import { Option } from "./classes/Option";
lazyRegister("Option", Option);

import { OptionMut } from "./classes/OptionMut";

import { Result } from "./classes/Result";
lazyRegister("Result", Result);

import { Vec } from "./classes/Vec";
lazyRegister("Vec", Vec);

import { Range } from "./util/Range";
import { UnitType, unit } from "./util/Unit";

export { Option, OptionMut, Iterator, Result, Range, Vec, unit, UnitType };
