import { Result } from "./result";
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

	public iter(): Iterator<Option<T>, Option<T>> {
		const val = this.value;
		return {
			next() {
				return {
					done: true,
					value: new Option(val),
				};
			},
		};
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
