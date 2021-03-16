import { Range, resolveRange } from "./types";
import { Option } from "./OptionResult";

export class Vec<T extends defined> {
	private constructor(private array: Array<T> = [], private length = array.size()) {}

	public static withCapacity<T>(size: number): Vec<T> {
		return new Vec(new Array(size));
	}
	public static vec<T>(...values: Array<T>): Vec<T> {
		return new Vec(values);
	}

	public i(i: number, failMessage: unknown = "called `Vec.i` with an out-of-range index: " + tostring(i)): T {
		const val = this.array[i];
		if (val === undefined) throw failMessage;
		return val;
	}

	public truncate(
		len: number,
		failMessage: unknown = "called `Vec.truncate` with an out-of-range length: " + tostring(len),
	): Vec<T> {
		if (len < 0) throw failMessage;
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
	public swapRemove(
		i: number,
		failMessage: unknown = "called `Vec.swapRemove` with an out-of-range index: " + tostring(i),
	): T {
		if (i < 0 || i >= this.length) throw failMessage;
		this.length--;
		return this.array.unorderedRemove(i) as T;
	}
	public insert(
		i: number,
		element: T,
		failMessage: unknown = "called `Vec.insert` with an out-of-range index: " + tostring(i),
	): Vec<T> {
		if (i < 0 || i > this.length) throw failMessage;
		this.length++;
		this.array.insert(i, element);
		return this;
	}
	public remove(
		i: number,
		failMessage: unknown = "called `Vec.remove` with an out-of-range index: " + tostring(i),
	): T {
		if (i < 0 || i >= this.length) throw failMessage;
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
			this.truncate(
				length - deleted,
				`@rbxts/rust-classes internal error. Please submit a bug report! len=${length} del=${deleted}`,
			);
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
					this.swap(
						nextRead,
						nextWrite,
						`@rbxts/rust-classes internal error. Please submit a bug report! r=${nextRead} w=${nextWrite} a`,
						`@rbxts/rust-classes internal error. Please submit a bug report! r=${nextRead} w=${nextWrite} b`,
					);
					nextWrite++;
				}
				nextRead++;
			}
			this.truncate(
				nextWrite,
				`@rbxts/rust-classes internal error. Please submit a bug report! r=${nextRead} w=${nextWrite}`,
			);
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
	public pop(): Option<T> {
		return new Option(this.array[this.length - 1]);
	}
	public append(other: Vec<T>): Vec<T> {
		for (const element of other.array) {
			this.array.push(element);
		}
		this.length += other.len();
		other.clear();
		return this;
	}
	public *drain(
		r: Range,
		failMessage: unknown = "called `Vec.drain` with an invalid `Range`: [" +
			tostring(r[0]) +
			", " +
			tostring(r[1]) +
			"]",
	): Generator<T> {
		const range = resolveRange(r, this.length);
		if (range[0] < 0 || range[0] >= range[1] || range[1] > this.length) {
			throw failMessage;
		}
		const array: Array<T> = [];
		for (let i = range[0]; i < range[1]; i++) {
			array.push(this.remove(range[0]));
		}
		let i = 0;
		while (i < array.size()) yield array[i++];
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
	public splitOff(
		from: number,
		failMessage: unknown = "called `Vec.splitOff` with an out-of-range index: " + tostring(from),
	): Vec<T> {
		if (from < 0 || from >= this.length) throw failMessage;
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
	public *splice(
		r: Range,
		iter: Generator<T>,
		failMessage: unknown = "called `Vec.splice` with an invalid `Range`: [" +
			tostring(r[0]) +
			", " +
			tostring(r[1]) +
			"]",
	): Generator<T> {
		const range = resolveRange(r, this.length);
		if (range[0] < 0 || range[0] >= range[1] || range[1] > this.length) {
			throw failMessage;
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
	public first(): Option<T> {
		return new Option(this.array[0]);
	}
	public last(): Option<T> {
		return new Option(this.array[this.length - 1]);
	}
	public get(i: number): Option<T> {
		return new Option(this.array[i]);
	}
	public swap(
		a: number,
		b: number,
		aFailMessage: unknown = "called `Vec.swap` with an out-of-range a: " + tostring(a),
		bFailMessage: unknown = "called `Vec.swap` with an out-of-range b: " + tostring(b),
	): Vec<T> {
		if (a < 0 || a >= this.length) throw aFailMessage;
		if (b < 0 || b >= this.length) throw bFailMessage;
		const temp = this.array[a];
		this.array[a] = this.array[b];
		this.array[b] = temp;
		return this;
	}
	public reverse(): Vec<T> {
		const tries = this.length - 1;
		for (let i = 0; i < tries / 2; i++) {
			this.swap(
				i,
				tries - i,
				`@rbxts/rust-classes internal error. Please submit a bug report! tries=${tries} i=${i} a`,
				`@rbxts/rust-classes internal error. Please submit a bug report! tries=${tries} i=${i} b`,
			);
		}
		return this;
	}
	public *iter(): Generator<T> {
		let i = 0;
		while (i < this.length) {
			yield this.array[i++];
		}
	}
}
