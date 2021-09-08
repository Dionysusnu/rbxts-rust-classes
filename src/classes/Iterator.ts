import type { Option as OptionType } from "../classes/Option";
import type { Result as ResultType } from "../classes/Result";
import type { Vec as VecType } from "../classes/Vec";

import { lazyGet } from "../util/lazyLoad";
import { Range, resolveRange } from "../util/Range";
import { fixedSizeHint, lowerSizeHint, SizeHint } from "../util/sizeHint";
import { unit, UnitType } from "../util/Unit";

let Option: typeof OptionType;
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

export class Iterator<T extends defined> {
	private consumed = false;
	public sizeHint: () => SizeHint;
	private constructor(public nextItem: () => OptionType<T>, sizeHint: (() => SizeHint) | undefined) {
		this.sizeHint = sizeHint ?? lowerSizeHint(0);
	}

	public static fromRawParts<T extends defined>(
		nextItem: () => OptionType<T>,
		sizeHint?: () => SizeHint,
	): Iterator<T> {
		return new Iterator(nextItem, sizeHint);
	}

	public static fromItems<T extends defined>(...items: Array<T>): Iterator<T> {
		let i = 0;
		return new Iterator(() => Option.wrap(items[i++]), fixedSizeHint(items.size()));
	}

	private consume() {
		if (this.consumed) error("Attempt to consume Iterator twice", 3);
		this.consumed = true;
	}

	public count(): number {
		this.consume();
		let i = 0;
		do {
			i++;
		} while (this.nextItem().isSome());
		return i;
	}

	public last(): OptionType<T> {
		this.consume();
		let last = Option.none<T>();
		while (true) {
			const curr = this.nextItem();
			if (curr.isNone()) break;
			last = curr;
		}
		return last;
	}

	public advanceBy(n: number): ResultType<UnitType, number> {
		for (let i = 0; i < n; i++) {
			if (this.nextItem().isNone()) {
				return Result.err(i - 1);
			}
		}
		return Result.ok(unit());
	}

	public nth(n: number): OptionType<T> {
		return this.advanceBy(n)
			.okOption()
			.andWith(() => this.nextItem());
	}

	public stepBy(step: number): Iterator<T> {
		this.consume();
		if (step === 0) error("called Iterator.stepBy with a step of 0", 2);
		let takeFirst = true;
		return new Iterator(
			() => {
				if (takeFirst) {
					takeFirst = false;
					return this.nextItem();
				} else {
					return this.nth(step - 1);
				}
			},
			() => {
				const [low, high] = this.sizeHint();
				const firstSize = (step: number) => (n: number) => n === 0 ? 0 : 1 + (n - 1) / step;
				const otherSize = (step: number) => (n: number) => n / step;
				const f = (takeFirst ? firstSize : otherSize)(step);
				return [f(low), high.map(f)] as SizeHint;
			},
		);
	}

	public chain<U>(other: Iterator<U>): Iterator<T | U> {
		this.consume();
		other.consume();
		let firstDone = false;
		return new Iterator<T | U>(
			() => {
				if (firstDone) {
					return other.nextItem();
				} else {
					const result = this.nextItem();
					if (result.isNone()) {
						firstDone = true;
						return other.nextItem();
					} else {
						return result;
					}
				}
			},
			() => {
				const [firstLow, firstHigh] = this.sizeHint();
				const [lastLow, lastHigh] = other.sizeHint();
				return [
					firstLow + lastLow,
					firstHigh.andWith((firstSize) => lastHigh.map((lastSize) => firstSize + lastSize)),
				] as SizeHint;
			},
		);
	}

	public zip<U>(other: Iterator<U>): Iterator<[T, U]> {
		this.consume();
		other.consume();
		return new Iterator(
			() => {
				const first = this.nextItem();
				if (first.isSome()) {
					return first.zip(other.nextItem());
				} else {
					return Option.none();
				}
			},
			() => {
				const [firstLow, firstHigh] = this.sizeHint();
				const [lastLow, lastHigh] = other.sizeHint();
				return [
					math.min(firstLow, lastLow),
					firstHigh
						.map((firstSize) =>
							lastHigh.map((lastSize) => math.min(firstSize, lastSize)).unwrapOr(firstSize),
						)
						.or(lastHigh),
				] as SizeHint;
			},
		);
	}

	/**
	 * Note: Behaviour when original Iterator ends is different to Rust.
	 */
	public intersperse<U>(other: U): Iterator<T | U> {
		return this.intersperseWith(() => other);
	}

	/**
	 * Note: Behaviour when original Iterator ends is different to Rust.
	 */
	public intersperseWith<U>(other: () => U): Iterator<T | U> {
		this.consume();
		let doIntermediate = true;
		return new Iterator<T | U>(
			() => {
				doIntermediate = !doIntermediate;
				if (doIntermediate) {
					return Option.some(other());
				} else {
					return this.nextItem();
				}
			},
			() => {
				const [low, high] = this.sizeHint();
				const f = (n: number) => {
					if (n < 2) {
						return n;
					} else {
						return n * 2 - 1;
					}
				};
				return [f(low), high.map(f)] as SizeHint;
			},
		);
	}

	public map<B>(f: (item: T) => B): Iterator<B> {
		this.consume();
		return new Iterator(
			() => this.nextItem().map(f),
			() => this.sizeHint(),
		);
	}

	public forEach(f: (item: T) => void): void {
		this.consume();
		let result;
		while (true) {
			result = this.nextItem();
			if (result.isNone()) break;
			result.map(f);
		}
	}

	public filter(f: (item: T) => boolean): Iterator<T> {
		this.consume();
		return new Iterator(
			() => {
				while (true) {
					const item = this.nextItem();
					if (item.isNone() || item.map(f).contains(true)) {
						return item;
					}
				}
			},
			() => [0, this.sizeHint()[1]] as SizeHint,
		);
	}

	public filterMap<U>(f: (item: T) => OptionType<U>): Iterator<U> {
		this.consume();
		return new Iterator(
			() => {
				while (true) {
					const item = this.nextItem();
					const mapped = item.andWith(f);
					if (mapped.isSome()) {
						return mapped;
					}
				}
			},
			() => [0, this.sizeHint()[1]] as SizeHint,
		);
	}

	public enumerate(): Iterator<[number, T]> {
		this.consume();
		let i = 0;
		return new Iterator(
			() =>
				Option.some(i)
					.zip(this.nextItem())
					.map((item) => {
						i++;
						return item;
					}),
			() => this.sizeHint(),
		);
	}

	public skipWhile(f: (item: T) => boolean): Iterator<T> {
		this.consume();
		while (true) {
			const item = this.nextItem();
			const mapped = item.map(f);
			if (!mapped.contains(true)) {
				break;
			}
		}
		return new Iterator(
			() => this.nextItem(),
			() => [0, this.sizeHint()[1]] as SizeHint,
		);
	}

	public takeWhile(f: (item: T) => boolean): Iterator<T> {
		this.consume();
		let done = false;
		return new Iterator(
			() => {
				if (done) {
					return Option.none();
				} else {
					const item = this.nextItem();
					const mapped = item.map(f);
					if (!mapped.contains(true)) {
						return item;
					} else {
						if (item.isSome()) {
							done = true;
						}
						return Option.none();
					}
				}
			},
			() => {
				if (done) {
					return [0, Option.some(0)] as SizeHint;
				} else {
					return [0, this.sizeHint()[1]] as SizeHint;
				}
			},
		);
	}

	public mapWhile<B>(f: (item: T) => OptionType<B>): Iterator<B> {
		this.consume();
		return new Iterator(
			() => this.nextItem().andWith(f),
			() => [0, this.sizeHint()[1]] as SizeHint,
		);
	}

	public skip(n: number): Iterator<T> {
		this.consume();
		let skipped = false;
		return new Iterator(
			() => {
				if (!skipped) {
					skipped = true;
					return this.nth(n);
				} else {
					return this.nextItem();
				}
			},
			() => {
				const [low, high] = this.sizeHint();
				return [math.max(0, low - n), high.map((size) => math.max(0, size - n))] as SizeHint;
			},
		);
	}

	public take(n: number): Iterator<T> {
		this.consume();
		let toGo = n;
		return new Iterator(
			() => {
				if (toGo > 0) {
					toGo--;
					return this.nextItem();
				} else {
					return Option.none();
				}
			},
			() => {
				const [low, high] = this.sizeHint();
				return [
					math.min(low, n),
					high.andWith((size) => (size < n ? Option.some(size) : Option.none())).or(Option.some(n)),
				] as SizeHint;
			},
		);
	}

	/**
	 * Only works correctly if the state is a reference.
	 * Use `[number]` as your state if you want a primitive type as state.
	 */
	public scan<St, B>(state: St, f: (state: St, item: T) => OptionType<B>): Iterator<B> {
		this.consume();
		return new Iterator(
			() => {
				return this.nextItem().andWith((item) => f(state, item));
			},
			() => [0, this.sizeHint()[1]] as SizeHint,
		);
	}

	public flatMap<U>(f: (item: T) => Iterator<U>): Iterator<U> {
		this.consume();
		let curr: Iterator<U>;
		return new Iterator(
			() => {
				const item = curr.nextItem();
				if (item.isNone()) {
					const nextIter = this.nextItem();
					return nextIter.match(
						(iter) => {
							curr = f(iter);
							return curr.nextItem();
						},
						() => {
							return Option.none();
						},
					);
				} else {
					return item;
				}
			},
			() => {
				if (this.sizeHint()[1].contains(0)) {
					return curr.sizeHint();
				} else {
					return [curr.sizeHint()[0], Option.none()] as SizeHint;
				}
			},
		);
	}

	public flatten<I>(this: Iterator<Iterator<I>>): Iterator<I> {
		return this.flatMap((i) => i);
	}

	public fuse(): Iterator<T> {
		this.consume();
		let done = false;
		return new Iterator(
			() => {
				if (done) {
					return Option.none();
				} else {
					const item = this.nextItem();
					if (item.isNone()) {
						done = true;
					}
					return item;
				}
			},
			() => {
				if (done) {
					return [0, Option.some(0)] as SizeHint;
				} else {
					return [0, this.sizeHint()[1]] as SizeHint;
				}
			},
		);
	}

	public inspect(f: (item: T) => void): Iterator<T> {
		this.consume();
		return new Iterator(
			() => {
				const item = this.nextItem();
				item.map(f);
				return item;
			},
			() => this.sizeHint(),
		);
	}

	public byRef(): Iterator<T> {
		return new Iterator(
			() => this.nextItem(),
			() => this.sizeHint(),
		);
	}

	public collect(): VecType<T> {
		this.consume();
		const size = this.sizeHint();
		const vec = Vec.withCapacity<T>(size[1].unwrapOr(size[0]));
		let item = this.nextItem();
		while (item.isSome()) {
			vec.push(item.unwrap());
			item = this.nextItem();
		}
		return vec;
	}

	public partition(f: (item: T) => boolean): LuaTuple<[VecType<T>, VecType<T>]> {
		const trueVec = Vec.vec();
		const falseVec = Vec.vec();
		this.forEach((item) => {
			if (f(item)) {
				trueVec.push(item);
			} else {
				falseVec.push(item);
			}
		});
		return [trueVec, falseVec] as LuaTuple<[VecType<T>, VecType<T>]>;
	}

	public tryFold<B, E>(init: B, f: (acc: B, item: T) => ResultType<B, E>): ResultType<B, E> {
		let acc = Result.ok<B, E>(init);
		let item = this.nextItem();
		while (item.isSome()) {
			acc = f(acc.asPtr() as B, item.unwrap());
			if (acc.isErr()) {
				break;
			}
			item = this.nextItem();
		}
		return acc;
	}

	public tryForEach<E>(f: (item: T) => ResultType<UnitType, E>): ResultType<UnitType, E> {
		return this.tryFold(unit(), (_, item) => f(item));
	}

	public fold<B>(init: B, f: (acc: B, item: T) => B): B {
		this.consume();
		let acc = init;
		let item = this.nextItem();
		while (item.isSome()) {
			acc = f(acc, item.unwrap());
			item = this.nextItem();
		}
		return acc;
	}

	public reduce(f: (acc: T, item: T) => T): OptionType<T> {
		return this.nextItem().match(
			(item) => Option.some(this.fold(item, f)),
			() => {
				this.consume();
				return Option.none();
			},
		);
	}

	public all(f: (item: T) => boolean): boolean {
		let item = this.nextItem();
		while (item.isSome()) {
			if (!f(item.unwrap())) {
				return false;
			}
			item = this.nextItem();
		}
		return true;
	}

	public any(f: (item: T) => boolean): boolean {
		let item = this.nextItem();
		while (item.isSome()) {
			if (f(item.unwrap())) {
				return true;
			}
			item = this.nextItem();
		}
		return false;
	}

	public find(f: (item: T) => boolean): OptionType<T> {
		let item = this.nextItem();
		while (item.isSome()) {
			if (f(item.unwrap())) {
				return item;
			}
			item = this.nextItem();
		}
		return Option.none();
	}

	public findMap<B>(f: (item: T) => OptionType<B>): OptionType<B> {
		let item = this.nextItem();
		while (item.isSome()) {
			const result = f(item.unwrap());
			if (result.isSome()) {
				return result;
			}
			item = this.nextItem();
		}
		return Option.none();
	}

	public tryFind<R>(f: (item: T) => ResultType<boolean, R>): ResultType<OptionType<T>, R> {
		let item = this.nextItem();
		while (item.isSome()) {
			const result = f(item.unwrap());
			if (result.contains(true)) {
				return Result.ok(item);
			} else if (result.isErr()) {
				// Result err variants are both R
				return result as never;
			}
			item = this.nextItem();
		}
		return Result.ok(Option.none());
	}

	public position(f: (item: T) => boolean): OptionType<number> {
		let item = this.nextItem();
		let i = 0;
		while (item.isSome()) {
			if (f(item.unwrap())) {
				return Option.some(i);
			}
			item = this.nextItem();
			i++;
		}
		return Option.none();
	}

	public max(this: Iterator<number>): OptionType<number> {
		return this.reduce((a, b) => (b >= a ? b : a));
	}

	public min(this: Iterator<number>): OptionType<number> {
		return this.reduce((a, b) => (b < a ? b : a));
	}

	public maxByKey(f: (item: T) => number): OptionType<T> {
		return this.reduce((a, b) => (f(b) >= f(a) ? b : a));
	}

	public minByKey(f: (item: T) => number): OptionType<T> {
		return this.reduce((a, b) => (f(b) < f(a) ? b : a));
	}

	/**
	 * Callback must return a number indicating the sort order.
	 *
	 * `a` is the accumulator, `b` is each item
	 *
	 * `num < 0` => a less than b
	 *
	 * `num = 0` => a equal to b
	 *
	 * `num > 0` => a greater than b
	 *
	 * For example, `(a, b) => a - b` will return the largest element.
	 */
	public maxBy(f: (a: T, b: T) => number): OptionType<T> {
		return this.reduce((a, b) => (f(a, b) >= 0 ? a : b));
	}

	public unzip<A, B>(this: Iterator<[A, B]>): LuaTuple<[VecType<A>, VecType<B>]> {
		this.consume();
		const size = this.sizeHint();
		const leftVec = Vec.withCapacity<A>(size[1].unwrapOr(size[0]));
		const rightVec = Vec.withCapacity<B>(size[1].unwrapOr(size[0]));
		let item = this.nextItem();
		while (item.isSome()) {
			const [a, b] = item.unwrap();
			leftVec.push(a);
			rightVec.push(b);
			item = this.nextItem();
		}
		return [leftVec, rightVec] as LuaTuple<[VecType<A>, VecType<B>]>;
	}

	public sum(this: Iterator<number>): number {
		return this.reduce((acc, item) => acc + item).unwrapOr(0);
	}

	public product(this: Iterator<number>): number {
		return this.reduce((acc, item) => acc * item).unwrapOr(1);
	}

	public eq(other: Iterator<T>): boolean {
		return this.eqBy(other, (a, b) => a === b);
	}

	public eqBy(other: Iterator<T>, eq: (a: T, b: T) => boolean): boolean {
		this.consume();
		while (true) {
			const item = this.nextItem();
			if (item.isNone()) {
				return other.nextItem().isNone();
			}
			const a = item.unwrap();
			const otherItem = other.nextItem();
			if (otherItem.isNone()) {
				return false;
			}
			const b = otherItem.unwrap();
			if (!eq(a, b)) {
				return false;
			}
		}
	}

	public ne(other: Iterator<T>): boolean {
		return !this.eq(other);
	}

	public isSorted(this: Iterator<number>): boolean {
		return this.isSortedBy((a, b) => Option.some(a - b));
	}

	/**
	 * Callback must return a number indicating the sort order.
	 *
	 * `a` is the accumulator, `b` is each item
	 *
	 * `num < 0` => a less than b
	 *
	 * `num = 0` => a equal to b
	 *
	 * `num > 0` => a greater than b
	 *
	 * For example, `(a, b) => a - b` will return the largest element.
	 */
	public isSortedBy(f: (a: T, b: T) => OptionType<number>): boolean {
		this.consume();
		const lastOpt = this.nextItem();
		if (lastOpt.isNone()) {
			return true;
		} else {
			let last = lastOpt.unwrap();
			return this.all((item) => {
				const result = f(last, item);
				if (!result.map((ord) => ord > 0).contains(false)) {
					return false;
				}
				last = item;
				return true;
			});
		}
	}

	public isSortedByKey(f: (item: T) => number): boolean {
		return this.map(f).isSorted();
	}

	public *generator(): Generator<T> {
		let item = this.nextItem();
		while (item.isSome()) {
			yield item.unwrap();
			item = this.nextItem();
		}
	}
}
