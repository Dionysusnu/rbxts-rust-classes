import { lazyRegister } from "./util/lazyLoad";

import { Iterator } from "./classes/Iterator";
lazyRegister("Iterator", Iterator);

import { Option } from "./classes/Option";
lazyRegister("Option", Option);

import { Result } from "./classes/Result";
lazyRegister("Vec", Vec);

import { Vec } from "./classes/Vec";
lazyRegister("Vec", Vec);

import { Range } from "./util/Range";
import { UnitType, unit } from "./util/Unit";

export { Option, Iterator, Result, Range, Vec, unit, UnitType };
