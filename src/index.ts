export class Option<T extends defined> {
	private constructor(protected value: T | undefined) {}

	public static none<T extends defined>(): Option<T> {
		return new Option<T>(undefined);
	}

	public static some<T extends defined>(val: T): Option<T> {
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

	public expect(msg: string): T | never {
		return this.isSome() ? this.value : error(msg);
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

	public mapOr<U>(def: U, func: (item: T) => U): Option<U> {
		return this.isSome() ? Option.some(func(this.value)) : Option.some(def);
	}

	public mapOrElse<U>(def: () => U, func: (item: T) => U): Option<U> {
		return this.isSome() ? Option.some(func(this.value)) : Option.some(def());
	}

	public okOr<E>(err: E): Result<T, E> {
		return this.isSome() ? Result.ok(this.value) : Result.err(err);
	}

	public okOrElse<E>(err: () => E): Result<T, E> {
		return this.isSome() ? Result.ok(this.value) : Result.err(err());
	}

	public and<U>(other: Option<U>): Option<U> {
		return this.isNone() ? Option.none() : other;
	}

	public andThen<U>(other: (val: T) => Option<U>): Option<U> {
		return this.isSome() ? other(this.value) : Option.none();
	}

	public filter(func: (val: T) => boolean): Option<T> {
		return this.isSome() ? (func(this.value) ? Option.some(this.value) : Option.none<T>()) : Option.none<T>();
	}

	public or(other: Option<T>): Option<T> {
		return this.isSome() ? Option.some(this.value) : other;
	}

	public orElse(other: () => Option<T>): Option<T> {
		return this.isSome() ? Option.some(this.value) : other();
	}

	public xor(other: Option<T>): Option<T> {
		if (this.isSome()) {
			if (other.isSome()) {
				return Option.none();
			}
			return Option.some(this.value);
		}
		return other.isSome() ? Option.some(other.value) : Option.none();
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
		return new Option(val);
	}

	public replace(val: T): Option<T> {
		const oldVal = this.value;
		this.value = val;
		return new Option(oldVal);
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

	public expectNone(msg: string): void | never {
		if (this.isSome()) error(msg);
	}

	public unwrapNone(): void | never {
		if (this.isSome()) error("called `Option.unwrapNone()` on a `Some` value: " + tostring(this.value));
	}
}

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
		return this.expect("called `Result.unwrap()` on an `Err` value: " + tostring(this.err));
	}

	public unwrapOr(def: T): T {
		return this.isOk() ? this.ok : def;
	}

	public unwrapOrElse(gen: () => T): T {
		return this.isOk() ? this.ok : gen();
	}

	public expectErr(msg: string): E | never {
		return this.isErr() ? this.err : error(msg);
	}

	public unwrapErr(): E | never {
		return this.expectErr("called `Result.unwrapErr()` on an `Ok` value: " + tostring(this.ok));
	}
}
