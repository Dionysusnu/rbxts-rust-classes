import type { Iterator as IteratorType } from "../classes/Iterator";
import type { Option as OptionType } from "../classes/Option";
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

let Vec: typeof VecType;
lazyGet("Vec", (c) => {
	Vec = c;
});

export class Result<T extends defined, E extends defined> {
	private constructor(protected readonly okValue: T | undefined, protected readonly errValue: E | undefined) {}

	public static ok<R extends defined, E extends defined>(val: R): Result<R, E> {
		return new Result<R, E>(val, undefined);
	}

	public static err<R extends defined, E extends defined>(val: E): Result<R, E> {
		return new Result<R, E>(undefined, val);
	}

	public static fromCallback<T extends defined>(c: () => T): Result<T, OptionType<defined>> {
		const [success, result] = pcall(c);
		return success ? Result.ok(result as T) : Result.err(Option.wrap(result));
	}

	public static fromVoidCallback(c: () => void): Result<UnitType, OptionType<defined>> {
		const [success, result] = pcall(c);
		return success ? Result.ok(unit()) : Result.err(Option.wrap(result!));
	}

	public static async fromPromise<T extends defined>(p: Promise<T>): Promise<Result<T, OptionType<defined>>> {
		try {
			return Result.ok(await p);
		} catch (e) {
			return Result.err(Option.wrap(e!));
		}
	}

	public static async fromVoidPromise(p: Promise<void>): Promise<Result<UnitType, OptionType<defined>>> {
		try {
			await p;
			return Result.ok(unit());
		} catch (e) {
			return Result.err(Option.wrap(e!));
		}
	}

	public isOk(): boolean {
		return this.okValue !== undefined;
	}

	public isErr(): boolean {
		return this.errValue !== undefined;
	}

	public contains(x: T): boolean {
		return this.okValue === x;
	}

	public containsErr(x: E): boolean {
		return this.errValue === x;
	}

	public okOption(): OptionType<T> {
		return Option.wrap(this.okValue);
	}

	public errOption(): OptionType<E> {
		return Option.wrap(this.errValue);
	}

	public map<U>(func: (item: T) => U): Result<U, E> {
		return this.isOk() ? Result.ok(func(this.okValue as T)) : Result.err(this.errValue as E);
	}

	public mapOr<U>(def: U, func: (item: T) => U): U {
		return this.isOk() ? func(this.okValue as T) : def;
	}

	public mapOrElse<U>(def: (item: E) => U, func: (item: T) => U): U {
		return this.isOk() ? func(this.okValue as T) : def(this.errValue as E);
	}

	public mapErr<F>(func: (item: E) => F): Result<T, F> {
		return this.isErr() ? Result.err(func(this.errValue as E)) : Result.ok(this.okValue as T);
	}

	public and<U>(other: Result<U, E>): Result<U, E> {
		return this.isErr() ? Result.err(this.errValue as E) : other;
	}

	public andThen<U>(func: (item: T) => Result<U, E>): Result<U, E> {
		return this.isErr() ? Result.err(this.errValue as E) : func(this.okValue as T);
	}

	public or<F>(other: Result<T, F>): Result<T, F> {
		return this.isOk() ? Result.ok(this.okValue as T) : other;
	}

	public orElse<F>(other: (item: E) => Result<T, F>): Result<T, F> {
		return this.isOk() ? Result.ok(this.okValue as T) : other(this.errValue as E);
	}

	public expect(msg: unknown): T | never {
		if (this.isOk()) return this.okValue as T;
		else throw msg;
	}

	public unwrap(): T | never {
		return this.expect("called `Result.unwrap()` on an `Err` value: " + tostring(this.errValue));
	}

	public unwrapOr(def: T): T {
		return this.isOk() ? (this.okValue as T) : def;
	}

	public unwrapOrElse(gen: (err: E) => T): T {
		return this.isOk() ? (this.okValue as T) : gen(this.errValue as E);
	}

	public expectErr(msg: unknown): E | never {
		if (this.isErr()) return this.errValue as E;
		else throw msg;
	}

	public unwrapErr(): E | never {
		return this.expectErr("called `Result.unwrapErr()` on an `Ok` value: " + tostring(this.okValue));
	}

	public transpose<R, E>(this: Result<OptionType<R>, E>): OptionType<Result<R, E>> {
		return this.isOk() ? this.okValue!.map((some) => Result.ok(some)) : Option.some(Result.err(this.errValue as E));
	}

	public flatten<R, E>(this: Result<Result<R, E>, E>): Result<R, E> {
		return this.isOk() ? new Result(this.okValue!.okValue, this.okValue!.errValue) : Result.err(this.errValue as E);
	}

	/**
	 * Executes one of two callbacks based on the type of the contained value.
	 * Replacement for Rust's `match` expression.
	 * @param ifOk Callback executed when this Result contains an Ok value.
	 * @param ifErr Callback executed when this Result contains an Err value.
	 */
	public match<R>(ifOk: (val: T) => R, ifErr: (err: E) => R): R {
		return this.isOk() ? ifOk(this.okValue as T) : ifErr(this.errValue as E);
	}

	public asPtr(): T | E {
		return (this.okValue as T) ?? (this.errValue as E);
	}
}

const resultMeta = Result as LuaMetatable<Result<never, never>>;
resultMeta.__eq = (a, b) =>
	b.match(
		(ok) => a.contains(ok),
		(err) => a.containsErr(err),
	);
resultMeta.__tostring = (result) =>
	result.match(
		(ok) => `Result.ok(${ok})`,
		(err) => `Result.err(${err})`,
	);
