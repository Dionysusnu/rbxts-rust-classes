import type { Iterator as IteratorType } from "../classes/Iterator";
import type { Option as OptionType } from "../classes/Option";
import type { Result as ResultType } from "../classes/Result";

import { lazyGet } from "../util/lazyLoad";
import { Range, resolveRange } from "../util/Range";
import { fixedSizeHint, SizeHint, upperSizeHint } from "../util/sizeHint";
import { unit, UnitType } from "../util/Unit";
import { recursiveToString } from "../util/recursiveToString";

let Iterator: typeof IteratorType;
lazyGet("Iterator", (c) => {
	Iterator = c;
});

let Option: typeof OptionType;
lazyGet("Option", (c) => {
	Option = c;
});

let Result: typeof ResultType;
lazyGet("Result", (c) => {
	Result = c;
});

export class Vec<T extends defined> {
	private length = this.array.size();
	private constructor(private array: Array<T>) {}

	public static withCapacity<T extends defined>(size: number): Vec<T> {
		return new Vec(new Array(size));
	}
	public static vec<T extends defined>(...values: Array<T>): Vec<T> {
		return new Vec(values);
	}
	public static fromPtr<T extends defined>(array: Array<T>): Vec<T> {
		return new Vec(array);
	}

	public toString(): string {
		return Option.wrap(next(["string"])).mapOr("Vec is Empty!", () => {
			return `Vec[${this.iter()
				.fold("", (acc, item) => acc + recursiveToString(item) + ", ")
				.sub(0, -3)}]`;
		});
	}

	public i(i: number): T {
		const val = this.array[i];
		if (val === undefined) error("called `Vec.i` with an out-of-range index: " + i, 2);
		return val;
	}

	public truncate(len: number): Vec<T> {
		if (len < 0) error("called `Vec.truncate` with an out-of-range length: " + len, 2);
		if (len >= this.length) return this;
		for (let i = this.length - 1; i >= len; i--) {
			delete this.array[i];
		}
		this.length = len;
		return this;
	}
	public asPtr(): Array<T> {
		return this.array;
	}
	public setLen(len: number): Vec<T> {
		this.length = len;
		return this;
	}
	public swapRemove(i: number): T {
		if (i < 0 || i >= this.length) error("called `Vec.swapRemove` with an out-of-range index: " + i, 2);
		this.length--;
		return this.array.unorderedRemove(i) as T;
	}
	public insert(i: number, element: T): Vec<T> {
		if (i < 0 || i > this.length) error("called `Vec.insert` with an out-of-range index: " + i, 2);
		this.length++;
		this.array.insert(i, element);
		return this;
	}
	public remove(i: number): T {
		if (i < 0 || i >= this.length) error("called `Vec.remove` with an out-of-range index: " + i, 2);
		this.length--;
		return this.array.remove(i) as T;
	}
	public retain(func: (element: T) => boolean): Vec<T> {
		const length = this.length;
		let deleted = 0;
		for (let i = 0; i < length; i++) {
			if (!func(this.array[i])) {
				deleted += 1;
			} else if (deleted > 0) {
				this.swap(i - deleted, i);
			}
		}
		if (deleted > 0) {
			this.truncate(length - deleted);
		}
		return this;
	}
	public dedupByKey<K>(func: (element: T) => K): Vec<T> {
		return this.dedupBy((a, b) => func(a) === func(b));
	}
	public dedupBy(isDup: (a: T, b: T) => boolean): Vec<T> {
		if (this.length > 1) {
			let nextRead = 1;
			let nextWrite = 1;
			while (nextRead < this.length) {
				if (!isDup(this.array[nextRead], this.array[nextWrite - 1])) {
					this.swap(nextRead, nextWrite);
					nextWrite++;
				}
				nextRead++;
			}
			this.truncate(nextWrite);
		}
		return this;
	}
	public dedup(): Vec<T> {
		return this.dedupBy((a, b) => a === b);
	}
	public push(element: T): Vec<T> {
		this.length++;
		this.array.push(element);
		return this;
	}
	public pop(): OptionType<T> {
		return Option.wrap(this.array.pop()).map((e) => {
			this.length--;
			return e;
		});
	}
	public append(other: Vec<T>): Vec<T> {
		for (const element of other.array) {
			this.array.push(element);
		}
		this.length += other.len();
		other.clear();
		return this;
	}
	public drain(r: Range): IteratorType<T> {
		const range = resolveRange(r, this.length);
		if (range[0] < 0 || range[0] > range[1] || range[1] > this.length) {
			error(`called \`Vec.drain\` with an invalid \`Range\`: [${r[0]}, ${r[1]}]`, 2);
		}
		const size = range[1] - range[0];
		let i = range[0];
		return Iterator.fromRawParts(() => (i < range[1] ? this.get(i++) : Option.none()), fixedSizeHint(size));
	}
	public drainFilter(r: Range, filter: (element: T) => boolean): IteratorType<T> {
		const range = resolveRange(r, this.length);
		if (range[0] < 0 || range[0] > range[1] || range[1] > this.length) {
			error(`called \`Vec.drainFilter\` with an invalid \`Range\`: [${r[0]}, ${r[1]}]`, 2);
		}
		const size = range[1] - range[0];
		let i = range[0];
		return Iterator.fromRawParts(() => {
			while (i < range[1]) {
				const element = this.get(i++);
				if (element.map(filter).contains(true)) {
					this.remove(i - 1);
					return element;
				}
			}
			return Option.none();
		}, upperSizeHint(size));
	}
	public clear(): Vec<T> {
		this.length = 0;
		this.array.clear();
		return this;
	}
	public len(): number {
		return this.length;
	}
	public isEmpty(): boolean {
		return this.length === 0;
	}
	public sort(this: Vec<number | string>): Vec<T> {
		table.sort(this.array);
		return this;
	}
	public sortByKey(this: Vec<Exclude<T, number|string>>, key: Exclude<keyof T, keyof { [K in keyof T as T[K] extends number | string ? never : K]: T[K] }>) {
		table.sort(this.array, (a, b) => b[key] > a[key]);
		return this;
	}
	public splitOff(from: number): Vec<T> {
		if (from < 0 || from >= this.length) error("called `Vec.splitOff` with an out-of-range index: " + from, 2);
		let other: Vec<T>;
		if (from === 0) {
			other = new Vec([...this.array]);
			this.clear();
		} else {
			other = Vec.withCapacity(this.length - from);
			for (let i = from; i < this.length; i++) {
				other.push(this.array[i]);
			}
			this.truncate(from);
		}
		return other;
	}
	public resizeWith(newLen: number, func: () => T): Vec<T> {
		if (newLen < this.length) {
			this.truncate(newLen);
		} else if (newLen > this.length) {
			for (let i = this.length; i < newLen; i++) {
				this.push(func());
			}
		}
		return this;
	}
	public resize(newLen: number, val: T): Vec<T> {
		if (newLen < this.length) {
			this.truncate(newLen);
		} else if (newLen > this.length) {
			for (let i = this.length; i < newLen; i++) {
				this.push(val);
			}
		}
		return this;
	}
	public *splice(r: Range, iter: Generator<T>): Generator<T> {
		const range = resolveRange(r, this.length);
		if (range[0] < 0 || range[0] > range[1] || range[1] > this.length) {
			error(`called \`Vec.splice\` with an invalid \`Range\`: ${r[0]}..${r[1]}`, 2);
		}
		let i = range[0];
		for (const item of iter) {
			if (i >= range[1]) break;
			const temp = this.array[i];
			this.array[i++] = item;
			yield temp;
		}
		while (i < range[1]) {
			this.array.remove(i);
			range[1]--;
		}
	}
	public first(): OptionType<T> {
		return Option.wrap(this.array[0]);
	}
	public last(): OptionType<T> {
		return Option.wrap(this.array[this.length - 1]);
	}
	public get(i: number): OptionType<T> {
		return Option.wrap(this.array[i]);
	}
	public swap(a: number, b: number): Vec<T> {
		if (a < 0 || a >= this.length) error("called `Vec.swap` with an out-of-range a: " + a, 2);
		if (b < 0 || b >= this.length) error("called `Vec.swap` with an out-of-range b: " + b, 2);
		const temp = this.array[a];
		this.array[a] = this.array[b];
		this.array[b] = temp;
		return this;
	}
	public reverse(): Vec<T> {
		const tries = this.length - 1;
		for (let i = 0; i < tries / 2; i++) {
			this.swap(i, tries - i);
		}
		return this;
	}
	public *generator(): Generator<T> {
		let i = 0;
		while (i < this.length) {
			yield this.array[i++];
		}
	}
	public iter(): IteratorType<T> {
		let i = 0;
		return Iterator.fromRawParts(() => {
			return this.get(i).map((item) => {
				i++;
				return item;
			});
		}, fixedSizeHint(this.length));
	}
}
