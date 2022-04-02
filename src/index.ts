// eslint-disable-next-line simple-import-sort/imports
import { lazyRegister } from "./util/lazyLoad";

import { Entry, HashMap } from "./classes/HashMap";
lazyRegister("HashMap", HashMap);

import { Iterator } from "./classes/Iterator";
lazyRegister("Iterator", Iterator);

import { Option } from "./classes/Option";
lazyRegister("Option", Option);

import { OptionMut } from "./classes/OptionMut";
lazyRegister("OptionMut", OptionMut);

import { Result } from "./classes/Result";
lazyRegister("Result", Result);

import { Vec } from "./classes/Vec";
lazyRegister("Vec", Vec);

import { Range } from "./util/Range";
import { unit, UnitType } from "./util/Unit";

export { Entry, HashMap, Iterator, Option, OptionMut, Range, Result, unit, UnitType, Vec };
