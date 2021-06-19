import type { Iterator as IteratorType } from "../classes/Iterator";
import type { Result as ResultType } from "../classes/Result";
import type { Vec as VecType } from "../classes/Vec";

import { lazyGet } from "../util/lazyLoad";
import { Range, resolveRange } from "../util/Range";
import { unit, UnitType } from "../util/Unit";

let Iterator: typeof IteratorType;
lazyGet("Iterator", (c) => {
	Iterator = c;
});

let Result: typeof ResultType;
lazyGet("Result", (c) => {
	Result = c;
});

let Vec: typeof VecType;
lazyGet("Vec", (c) => {
	Vec = c;
});

export class Option<T extends defined> {
	private constructor(protected value: T | undefined) {}

	public static none<T extends defined>(): Option<T> {
		return new Option<T>(undefined);
	}

	public static some<T extends defined>(val: T): Option<T> {
		return new Option(val);
	}

	public static wrap<T extends defined>(val: T | undefined): Option<T> {
		return new Option(val);
	}

	public isSome(): this is { value: T } {
		return this.value !== undefined;
	}

	public isNone(): this is { value: undefined } {
		return !this.isSome();
	}

	public contains(x: T): boolean {
		return this.value === x;
	}

	public expect(msg: unknown): T | never {
		if (this.isSome()) return this.value;
		else throw msg;
	}

	public unwrap(): T | never {
		return this.expect("called `Option.unwrap()` on a `None` value");
	}

	public unwrapOr(def: T): T {
		return this.isSome() ? this.value : def;
	}

	public unwrapOrElse(gen: () => T): T {
		return this.isSome() ? this.value : gen();
	}

	public map<U>(func: (item: T) => U): Option<U> {
		return this.isSome() ? Option.some(func(this.value)) : Option.none();
	}

	public mapOr<U>(def: U, func: (item: T) => U): U {
		return this.isSome() ? func(this.value) : def;
	}

	public mapOrElse<U>(def: () => U, func: (item: T) => U): U {
		return this.isSome() ? func(this.value) : def();
	}

	public okOr<E>(err: E): ResultType<T, E> {
		return this.isSome() ? Result.ok(this.value) : Result.err(err);
	}

	public okOrElse<E>(err: () => E): ResultType<T, E> {
		return this.isSome() ? Result.ok(this.value) : Result.err(err());
	}

	public iter(): IteratorType<T> {
		return Iterator.fromRawParts(
			() => this.take(),
			() => (this.isSome() ? [1, Option.some(1)] : [0, Option.none()]) as LuaTuple<[number, Option<number>]>,
		);
	}

	public and<U>(other: Option<U>): Option<U> {
		return this.isNone() ? Option.none() : other;
	}

	public andThen<U>(other: (val: T) => Option<U>): Option<U> {
		return this.isSome() ? other(this.value) : Option.none();
	}

	public filter(func: (val: T) => boolean): Option<T> {
		return this.isSome() ? (func(this.value) ? Option.some(this.value) : Option.none()) : Option.none();
	}

	public or(other: Option<T>): Option<T> {
		return this.isSome() ? Option.some(this.value) : other;
	}

	public orElse(other: () => Option<T>): Option<T> {
		return this.isSome() ? Option.some(this.value) : other();
	}

	public xor(other: Option<T>): Option<T> {
		return this.isSome()
			? other.isSome()
				? Option.none()
				: Option.some(this.value)
			: other.isSome()
			? Option.some(other.value)
			: Option.none();
	}

	public insert(val: T): T {
		return (this.value = val);
	}

	public getOrInsert(val: T): T {
		if (!this.isSome()) {
			return (this.value = val);
		} else {
			return this.value;
		}
	}

	public getOrInsertWith(val: () => T): T {
		if (!this.isSome()) {
			return (this.value = val());
		} else {
			return this.value;
		}
	}

	public take(): Option<T> {
		const val = this.value;
		this.value = undefined;
		return Option.wrap(val);
	}

	public replace(val: T): Option<T> {
		const oldVal = this.value;
		this.value = val;
		return Option.wrap(oldVal);
	}

	public zip<U>(other: Option<U>): Option<[T, U]> {
		if (this.isSome() && other.isSome()) {
			return Option.some([this.value, other.value]);
		}
		return Option.none();
	}

	public zipWith<U, R>(other: Option<U>, func: (self: T, other: U) => R): Option<R> {
		if (this.isSome() && other.isSome()) {
			return Option.some(func(this.value, other.value));
		}
		return Option.none();
	}

	public copied(): Option<T> {
		return Option.wrap(this.value);
	}

	public cloned(this: Option<{ cloned: () => T }>): Option<T> {
		return this.map((i) => i.cloned());
	}

	public transpose<R, E>(this: Option<ResultType<R, E>>): ResultType<Option<R>, E> {
		return this.isSome()
			? this.value.isOk()
				? Result.ok(Option.some(this.value.unwrap()))
				: Result.err(this.value.unwrapErr())
			: Result.ok(Option.none());
	}

	public flatten<I>(this: Option<Option<I>>): Option<I> {
		return this.isSome() ? Option.wrap(this.value.value) : Option.none();
	}

	/**
	 * Executes one of two callbacks based on the type of the contained value.
	 * Replacement for Rust's `match` expression.
	 * @param ifSome Callback executed when this Option contains a Some value.
	 * @param ifNone Callback executed when this Option contains a None value.
	 */
	public match<R>(ifSome: (val: T) => R, ifNone: () => R): R {
		return this.isSome() ? ifSome(this.value) : ifNone();
	}

	/**
	 * Returns the contained value directly. Only meant for special cases like serialisation.
	 */
	public asPtr(): T | undefined {
		return this.value;
	}
}

const optionMeta = Option as LuaMetatable<Option<never>>;
optionMeta.__unm = (option) => option.map((item) => -(item as number)) as Option<never>;
optionMeta.__add = (option, other) => option.andThen((item) => other.map((otherItem) => (item + otherItem) as never));
optionMeta.__sub = (option, other) => option.andThen((item) => other.map((otherItem) => (item - otherItem) as never));
optionMeta.__mul = (option, other) => option.andThen((item) => other.map((otherItem) => (item * otherItem) as never));
optionMeta.__div = (option, other) => option.andThen((item) => other.map((otherItem) => (item / otherItem) as never));
optionMeta.__mod = (option, other) => option.andThen((item) => other.map((otherItem) => (item % otherItem) as never));
optionMeta.__pow = (option, other) => option.andThen((item) => other.map((otherItem) => (item ^ otherItem) as never));
optionMeta.__tostring = (option) =>
	option.match(
		(val) => `Option.some(${val})`,
		() => "Option.none",
	);
optionMeta.__eq = (a, b) => a.asPtr() === b.asPtr();
optionMeta.__len = (option) => option.map((item) => (item as Array<never>).size()).unwrapOr(0);
