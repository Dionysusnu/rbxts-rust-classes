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

	public expectNone(msg: unknown): void | never {
		if (this.isSome()) throw msg;
	}

	public unwrapNone(): void | never {
		return this.expectNone("called `Option.unwrapNone()` on a `Some` value: " + tostring(this.value));
	}

	public transpose<R, E>(this: Option<Result<R, E>>): Result<Option<R>, E> {
		return this.isSome()
			? this.value.isOk()
				? Result.ok(Option.some(this.value.unwrap()))
				: Result.err(this.value.unwrapErr())
			: Result.ok(Option.none());
	}

	public flatten<I>(this: Option<Option<I>>): Option<I> {
		return this.isSome() ? new Option(this.value.value) : Option.none();
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

const optionMeta = getmetatable(Option) as LuaMetatable<Option<never>>;
optionMeta.__eq = (a, b) => a.asPtr() === b.asPtr();
optionMeta.__tostring = (option) =>
	option.match(
		(val) => `Option.some(${val})`,
		() => "Option.none",
	);

export class Result<T extends defined, E extends defined> {
	private constructor(protected okValue: T | undefined, protected errValue: E | undefined) {}

	public static ok<R, E>(val: R): Result<R, E> {
		return new Result<R, E>(val, undefined);
	}

	public static err<R, E>(val: E): Result<R, E> {
		return new Result<R, E>(undefined, val);
	}

	public static fromCallback<T extends Callback>(c: T): Result<ReturnType<T>, string> {
		const result = opcall(c);
		return result.success ? Result.ok(result.value) : Result.err(result.error);
	}

	public static async fromPromise<T extends defined>(p: Promise<T>): Promise<Result<T, string>> {
		try {
			return Result.ok(await p);
		} catch (e) {
			return Result.err(e);
		}
	}

	public isOk(): this is { okValue: T; errValue: undefined } {
		return this.okValue !== undefined;
	}

	public isErr(): this is { okValue: undefined; errValue: E } {
		return this.errValue !== undefined;
	}

	public contains(x: T): boolean {
		return this.okValue === x;
	}

	public containsErr(x: E): boolean {
		return this.errValue === x;
	}

	public okOption(): Option<T> {
		return this.isOk() ? Option.some(this.okValue) : Option.none();
	}

	public errOption(): Option<E> {
		return this.isErr() ? Option.some(this.errValue) : Option.none();
	}

	public map<U>(func: (item: T) => U): Result<U, E> {
		return this.isOk() ? Result.ok(func(this.okValue)) : Result.err(this.errValue as E);
	}

	public mapOr<U>(def: U, func: (item: T) => U): U {
		return this.isOk() ? func(this.okValue) : def;
	}

	public mapOrElse<U>(def: (item: E) => U, func: (item: T) => U): U {
		return this.isOk() ? func(this.okValue) : def(this.errValue as E);
	}

	public mapErr<F>(func: (item: E) => F): Result<T, F> {
		return this.isErr() ? Result.err(func(this.errValue)) : Result.ok(this.okValue as T);
	}

	public and<U>(other: Result<U, E>): Result<U, E> {
		return this.isErr() ? Result.err(this.errValue) : other;
	}

	public andThen<U>(func: (item: T) => Result<U, E>): Result<U, E> {
		return this.isErr() ? Result.err(this.errValue) : func(this.okValue as T);
	}

	public or<F>(other: Result<T, F>): Result<T, F> {
		return this.isOk() ? Result.ok(this.okValue) : other;
	}

	public orElse<F>(other: (item: E) => Result<T, F>): Result<T, F> {
		return this.isOk() ? Result.ok(this.okValue) : other(this.errValue as E);
	}

	public expect(msg: unknown): T | never {
		if (this.isOk()) return this.okValue;
		else throw msg;
	}

	public unwrap(): T | never {
		return this.expect("called `Result.unwrap()` on an `Err` value: " + tostring(this.errValue));
	}

	public unwrapOr(def: T): T {
		return this.isOk() ? this.okValue : def;
	}

	public unwrapOrElse(gen: () => T): T {
		return this.isOk() ? this.okValue : gen();
	}

	public expectErr(msg: unknown): E | never {
		if (this.isErr()) return this.errValue;
		else throw msg;
	}

	public unwrapErr(): E | never {
		return this.expectErr("called `Result.unwrapErr()` on an `Ok` value: " + tostring(this.okValue));
	}

	public transpose<R, E>(this: Result<Option<R>, E>): Option<Result<R, E>> {
		return this.isOk() ? this.okValue.map((some) => Result.ok(some)) : Option.some(Result.err(this.errValue as E));
	}

	public flatten<R, E>(this: Result<Result<R, E>, E>): Result<R, E> {
		return this.isOk() ? new Result(this.okValue.okValue, this.okValue.errValue) : Result.err(this.errValue as E);
	}

	/**
	 * Executes one of two callbacks based on the type of the contained value.
	 * Replacement for Rust's `match` expression.
	 * @param ifOk Callback executed when this Result contains an Ok value.
	 * @param ifErr Callback executed when this Result contains an Err value.
	 */
	public match<R>(ifOk: (val: T) => R, ifErr: (err: E) => R): R {
		return this.isOk() ? ifOk(this.okValue) : ifErr(this.errValue as E);
	}

	public asPtr(): [T, undefined] | [undefined, E] {
		return [this.okValue, this.errValue] as never;
	}
}

const resultMeta = getmetatable(Result) as LuaMetatable<Result<never, never>>;
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
