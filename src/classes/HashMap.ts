import type { Iterator as IteratorType } from "../classes/Iterator";
import type { Option as OptionType } from "../classes/Option";
import type { Result as ResultType } from "../classes/Result";
import type { Vec as VecType } from "../classes/Vec";

import { lazyGet } from "../util/lazyLoad";
import { Range, resolveRange } from "../util/Range";
import { fixedSizeHint, SizeHint, upperSizeHint } from "../util/sizeHint";
import { unit, UnitType } from "../util/Unit";

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

let Vec: typeof VecType;
lazyGet("Vec", (c) => {
	Vec = c;
});

export class Entry<K extends defined, V extends defined> {
	private constructor(private map: HashMap<K, V>, private index: K) {}
	/** @internal */
	public static construct<K extends defined, V extends defined>(map: HashMap<K, V>, key: K): Entry<K, V> {
		return new Entry(map, key);
	}
	public orInsert(def: V): V {
		return this.map.get(this.index).unwrapOrElse(() => {
			this.map.insert(this.index, def);
			return def;
		});
	}
	public orInsertWith(def: () => V): V {
		return this.map.get(this.index).unwrapOrElse(() => {
			const val = def();
			this.map.insert(this.index, val);
			return val;
		});
	}
	public orInsertWithKey(def: (key: K) => V): V {
		return this.map.get(this.index).unwrapOrElse(() => {
			const val = def(this.index);
			this.map.insert(this.index, val);
			return val;
		});
	}
	public key(): K {
		return this.index;
	}
	/**
	 * Only works correctly if the value is a reference.
	 * Use `[number]` as your value if you want a primitive type as value.
	 */
	public andModify(f: (value: V) => void): Entry<K, V> {
		const val = this.map.get(this.index);
		if (val.isSome()) f(val.unwrap());
		return this;
	}
	public insert(value: V): Entry<K, V> {
		this.map.insert(this.index, value);
		return this;
	}
}

export class HashMap<K extends defined, V extends defined> {
	private length = this.map.size();
	private constructor(private map: Map<K, V>) {}
	public static withCapacity<K extends defined, V extends defined>(size: number): HashMap<K, V> {
		return new HashMap(new Array(size) as unknown as Map<K, V>);
	}
	public static empty<K extends defined, V extends defined>(): HashMap<K, V> {
		return new HashMap(new Map());
	}
	public static fromPtr<K extends defined, V extends defined>(map: Map<K, V>): HashMap<K, V> {
		return new HashMap(map);
	}

	public toString(): string {
		return `HashMap{${this.iter()
			.fold("", (acc, item) => `${acc}(${item[0]}, ${item[1]}), `)
			.sub(0, -3)}}`;
	}

	public i(i: K): V {
		const val = this.map.get(i);
		if (val === undefined) error("called `HashMap.i` with an out-of-range index: " + i, 2);
		return val;
	}

	public keys(): IteratorType<K> {
		let last: K | undefined;
		return Iterator.fromRawParts(() => {
			const key = next(this.map, last)[0];
			return Option.wrap(key).map(() => {
				last = key;
				return key;
			});
		}, fixedSizeHint(this.length));
	}
	public values(): IteratorType<V> {
		let last: K | undefined;
		return Iterator.fromRawParts(() => {
			const [key, value] = next(this.map, last);
			return Option.wrap(value).map(() => {
				last = key;
				return value;
			});
		}, fixedSizeHint(this.length));
	}
	public iter(): IteratorType<[K, V]> {
		let last: K | undefined;
		return Iterator.fromRawParts(() => {
			const [key, value] = next(this.map, last);
			return Option.wrap(value).map(() => {
				last = key;
				return [key, value];
			});
		}, fixedSizeHint(this.length));
	}
	public len(): number {
		return this.length;
	}
	public isEmpty(): boolean {
		return next(this.map)[0] === undefined;
	}
	public drain(): IteratorType<[K, V]> {
		let last: K | undefined;
		return Iterator.fromRawParts(() => {
			const [key, value] = next(this.map, last);
			return this.removeEntry(key).map(() => {
				last = key;
				return [key, value];
			});
		}, fixedSizeHint(this.length));
	}
	public drainFilter(filter: (key: K, value: V) => boolean): IteratorType<[K, V]> {
		let last: K | undefined;
		return Iterator.fromRawParts(() => {
			while ((last = next(this.map, last)[0]) !== undefined) {
				const element = this.removeEntry(last);
				if (element.map(([k, v]) => filter(k, v)).contains(true)) {
					return element;
				}
			}
			return Option.none();
		}, upperSizeHint(this.length));
	}
	public clear(): HashMap<K, V> {
		this.map.clear();
		this.length = 0;
		return this;
	}
	public entry(key: K): Entry<K, V> {
		return Entry.construct(this, key);
	}
	public get(key: K): OptionType<V> {
		return Option.wrap(this.map.get(key));
	}
	public getKeyValue(key: K): OptionType<[K, V]> {
		return Option.some(key).zip(Option.wrap(this.map.get(key)));
	}
	public containsKey(key: K): boolean {
		return this.map.has(key);
	}
	public insert(key: K, value: V): OptionType<V> {
		const old = this.map.get(key);
		if (old === undefined) this.length++;
		this.map.set(key, value);
		return Option.wrap(old);
	}
	public tryInsert(key: K, value: V): ResultType<V, { entry: Entry<K, V>; value: V }> {
		const old = this.map.get(key);
		if (old) {
			return Result.err({ entry: Entry.construct(this, key), value });
		}
		this.length++;
		this.map.set(key, value);
		return Result.ok(value);
	}
	public remove(key: K): OptionType<V> {
		const old = this.map.get(key);
		if (old !== undefined) this.length--;
		this.map.delete(key);
		return Option.wrap(old);
	}
	public removeEntry(key: K): OptionType<[K, V]> {
		const old = this.map.get(key);
		if (old !== undefined) this.length--;
		this.map.delete(key);
		return Option.some(key).zip(Option.wrap(old));
	}
	public retain(filter: (key: K, value: V) => boolean): HashMap<K, V> {
		this.iter().forEach(([k, v]) => {
			if (!filter(k, v)) {
				this.remove(k);
			}
		});
		return this;
	}
	public intoKeys(): IteratorType<K> {
		let last: K | undefined;
		return Iterator.fromRawParts(() => {
			const [key, value] = next(this.map, last);
			return Option.wrap(key).map(() => {
				last = key;
				return key;
			});
		}, fixedSizeHint(this.length));
	}
	public intoValues(): IteratorType<V> {
		let last: K | undefined;
		return Iterator.fromRawParts(() => {
			const [key, value] = next(this.map, last);
			return Option.wrap(key).map(() => {
				last = key;
				return value;
			});
		}, fixedSizeHint(this.length));
	}
}
