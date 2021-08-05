import { lazyRegister } from "./util/lazyLoad";

import { Entry, HashMap } from "./classes/HashMap";
lazyRegister("HashMap", HashMap);

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

export { Entry, HashMap, Iterator, Option, OptionMut, Result, Range, Vec, unit, UnitType };
