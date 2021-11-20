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
	protected constructor(protected readonly value: T | undefined) {}

	public static none<T extends defined>(): Option<T> {
		return new Option<T>(undefined);
	}

	public static some<T extends defined>(val: T): Option<T> {
		return new Option(val);
	}

	public static wrap<T extends defined>(val: T | undefined): Option<T> {
		return new Option(val);
	}

	public toString(): string {
		return this.match(
			(val) => `Option.some(${val})`,
			() => "Option.none",
		);
	}

	public isSome(): boolean {
		return this.value !== undefined;
	}

	public isNone(): boolean {
		return !this.isSome();
	}

	public contains(x: T): boolean {
		return this.value === x;
	}

	public expect(msg: unknown): T | never {
		if (this.isSome()) return this.value as T;
		else throw msg;
	}

	public unwrap(): T | never {
		return this.expect("called `Option.unwrap()` on a `None` value");
	}

	public unwrapOr(def: T): T {
		return this.isSome() ? (this.value as T) : def;
	}

	public unwrapOrElse(gen: () => T): T {
		return this.isSome() ? (this.value as T) : gen();
	}

	public map<U>(func: (item: T) => U): Option<U> {
		return this.isSome() ? Option.some(func(this.value as T)) : Option.none();
	}

	public mapOr<U>(def: U, func: (item: T) => U): U {
		return this.isSome() ? func(this.value as T) : def;
	}

	public mapOrElse<U>(def: () => U, func: (item: T) => U): U {
		return this.isSome() ? func(this.value as T) : def();
	}

	public okOr<E>(err: E): ResultType<T, E> {
		return this.isSome() ? Result.ok(this.value as T) : Result.err(err);
	}

	public okOrElse<E>(err: () => E): ResultType<T, E> {
		return this.isSome() ? Result.ok(this.value as T) : Result.err(err());
	}

	public and<U>(other: Option<U>): Option<U> {
		return this.isNone() ? Option.none() : other;
	}

	public andWith<U>(other: (val: T) => Option<U>): Option<U> {
		return this.isSome() ? other(this.value as T) : Option.none();
	}

	public filter(func: (val: T) => boolean): Option<T> {
		return this.isSome() ? (func(this.value as T) ? Option.some(this.value as T) : Option.none()) : Option.none();
	}

	public or(other: Option<T>): Option<T> {
		return this.isSome() ? Option.some(this.value as T) : other;
	}

	public orElse(other: () => Option<T>): Option<T> {
		return this.isSome() ? Option.some(this.value as T) : other();
	}

	public xor(other: Option<T>): Option<T> {
		return this.isSome()
			? other.isSome()
				? Option.none()
				: Option.some(this.value as T)
			: other.isSome()
			? Option.some(other.value as T)
			: Option.none();
	}

	public zip<U>(other: Option<U>): Option<[T, U]> {
		if (this.isSome() && other.isSome()) {
			return Option.some([this.value as T, other.value as U]);
		}
		return Option.none();
	}

	public zipWith<U, R>(other: Option<U>, func: (self: T, other: U) => R): Option<R> {
		if (this.isSome() && other.isSome()) {
			return Option.some(func(this.value as T, other.value as U));
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
			? this.value!.isOk()
				? Result.ok(Option.some(this.value!.asPtr() as R))
				: Result.err(this.value!.asPtr() as E)
			: Result.ok(Option.none());
	}

	public flatten<I>(this: Option<Option<I>>): Option<I> {
		return this.isSome() ? Option.wrap(this.value!.value) : Option.none();
	}

	/**
	 * Executes one of two callbacks based on the type of the contained value.
	 * Replacement for Rust's `match` expression.
	 * @param ifSome Callback executed when this Option contains a Some value.
	 * @param ifNone Callback executed when this Option contains a None value.
	 */
	public match<R>(ifSome: (val: T) => R, ifNone: () => R): R {
		return this.isSome() ? ifSome(this.value as T) : ifNone();
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
optionMeta.__add = (option, other) => option.andWith((item) => other.map((otherItem) => (item + otherItem) as never));
optionMeta.__sub = (option, other) => option.andWith((item) => other.map((otherItem) => (item - otherItem) as never));
optionMeta.__mul = (option, other) => option.andWith((item) => other.map((otherItem) => (item * otherItem) as never));
optionMeta.__div = (option, other) => option.andWith((item) => other.map((otherItem) => (item / otherItem) as never));
optionMeta.__mod = (option, other) => option.andWith((item) => other.map((otherItem) => (item % otherItem) as never));
optionMeta.__pow = (option, other) => option.andWith((item) => other.map((otherItem) => (item ^ otherItem) as never));

optionMeta.__eq = (a, b) => a.asPtr() === b.asPtr();
optionMeta.__len = (option) => option.map((item) => (item as Array<never>).size()).unwrapOr(0);
