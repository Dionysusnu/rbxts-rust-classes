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

let Option!: typeof OptionType;
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

export class OptionMut<T> extends Option<T> {
	protected value: T | undefined;

	public static none<T extends defined>(): OptionMut<T> {
		return new OptionMut<T>(undefined);
	}

	public static some<T extends defined>(val: T): OptionMut<T> {
		return new OptionMut(val);
	}

	public static wrap<T extends defined>(val: T | undefined): OptionMut<T> {
		return new OptionMut(val);
	}

	public insert(val: T): T {
		return (this.value = val);
	}

	public getOrInsert(val: T): T {
		if (!this.isSome()) {
			return (this.value = val);
		} else {
			return this.value as T;
		}
	}

	public getOrInsertWith(val: () => T): T {
		if (!this.isSome()) {
			return (this.value = val());
		} else {
			return this.value as T;
		}
	}

	public take(): OptionType<T> {
		const val = this.value;
		this.value = undefined;
		return Option.wrap(val);
	}

	public replace(val: T): OptionType<T> {
		const oldVal = this.value;
		this.value = val;
		return Option.wrap(oldVal);
	}

	public iter(): IteratorType<T> {
		return Iterator.fromRawParts(
			() => this.take(),
			() => (this.isSome() ? [1, Option.some(1)] : [0, Option.some(0)]) as LuaTuple<[number, OptionType<number>]>,
		);
	}
}

const optionMutMeta = OptionMut as LuaMetatable<OptionType<never>>;
optionMutMeta.__unm = (option) => option.map((item) => -(item as number)) as OptionType<never>;
optionMutMeta.__add = (option, other) =>
	option.andWith((item) => other.map((otherItem) => (item + otherItem) as never));
optionMutMeta.__sub = (option, other) =>
	option.andWith((item) => other.map((otherItem) => (item - otherItem) as never));
optionMutMeta.__mul = (option, other) =>
	option.andWith((item) => other.map((otherItem) => (item * otherItem) as never));
optionMutMeta.__div = (option, other) =>
	option.andWith((item) => other.map((otherItem) => (item / otherItem) as never));
optionMutMeta.__mod = (option, other) =>
	option.andWith((item) => other.map((otherItem) => (item % otherItem) as never));
optionMutMeta.__pow = (option, other) =>
	option.andWith((item) => other.map((otherItem) => (item ^ otherItem) as never));
optionMutMeta.__tostring = (option) =>
	option.match(
		(val) => `OptionMut.some(${val})`,
		() => "OptionMut.none",
	);
optionMutMeta.__eq = (a, b) => a.asPtr() === b.asPtr();
optionMutMeta.__len = (option) => option.map((item) => (item as Array<never>).size()).unwrapOr(0);
