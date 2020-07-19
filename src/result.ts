import { Option } from "./option";

export class Result<T, E> {
	private constructor(protected ok: T | undefined, protected err: E | undefined) {}

	public static ok<R, E>(val: R): Result<R, E> {
		return new Result<R, E>(val, undefined);
	}

	public static err<R, E>(val: E): Result<R, E> {
		return new Result<R, E>(undefined, val);
	}

	public isOk(): this is { ok: T; err: undefined } {
		return this.ok !== undefined;
	}

	public isErr(): this is { ok: undefined; err: E } {
		return this.err !== undefined;
	}

	public contains(x: T): boolean {
		return this.ok === x;
	}

	public containsErr(x: E): boolean {
		return this.err === x;
	}

	public okOption(): Option<T> {
		return this.isOk() ? Option.some(this.ok) : Option.none();
	}

	public errOption(): Option<E> {
		return this.isErr() ? Option.some(this.err) : Option.none();
	}

	public map<U>(func: (item: T) => U): Result<U, E> {
		return this.isOk() ? Result.ok(func(this.ok)) : Result.err(this.err as E);
	}

	public mapOr<U>(def: U, func: (item: T) => U): U {
		return this.isOk() ? func(this.ok) : def;
	}

	public mapOrElse<U>(def: (item: E) => U, func: (item: T) => U): U {
		return this.isOk() ? func(this.ok) : def(this.err as E);
	}

	public mapErr<F>(func: (item: E) => F): Result<T, F> {
		return this.isErr() ? Result.err(func(this.err)) : Result.ok(this.ok as T);
	}

	public iter(): Iterator<Option<T>, Option<T>> {
		const val = this.ok;
		return {
			next() {
				return {
					done: true,
					value: Option.some(val as T),
				};
			},
		};
	}

	public and<U>(other: Result<U, E>): Result<U, E> {
		return this.isErr() ? Result.err(this.err) : other;
	}

	public andThen<U>(func: (item: T) => Result<U, E>): Result<U, E> {
		return this.isErr() ? Result.err(this.err) : func(this.ok as T);
	}

	public or<F>(other: Result<T, F>): Result<T, F> {
		return this.isOk() ? Result.ok(this.ok) : other;
	}

	public orElse<F>(other: (item: E) => Result<T, F>): Result<T, F> {
		return this.isOk() ? Result.ok(this.ok) : other(this.err as E);
	}

	public expect(msg: string): T | never {
		return this.isOk() ? this.ok : error(msg);
	}

	public unwrap(): T | never {
		return this.isOk() ? this.ok : error("called `Option.unwrap()` on an `Err` value");
	}

	public unwrapOr(def: T): T {
		return this.isOk() ? this.ok : def;
	}

	public unwrapOrElse(gen: () => T): T {
		return this.isOk() ? this.ok : gen();
	}
}
