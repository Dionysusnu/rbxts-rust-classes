import type { HashMap } from "classes/HashMap";
import type { Iterator } from "../classes/Iterator";
import type { Option } from "../classes/Option";
import type { Result } from "../classes/Result";
import type { Vec } from "../classes/Vec";

interface ClassMap {
	HashMap: typeof HashMap;
	Iterator: typeof Iterator;
	Option: typeof Option;
	Result: typeof Result;
	Vec: typeof Vec;
}

const classes: Partial<Record<keyof ClassMap, ClassMap[keyof ClassMap]>> = {};
const waiting: Partial<
	Record<keyof ClassMap, [Promise<ClassMap[keyof ClassMap]>, (c: ClassMap[keyof ClassMap]) => void]>
> = {};

export function lazyGet<T extends keyof ClassMap>(name: T, callback: (c: ClassMap[T]) => void): void {
	const c = classes[name];
	if (c) {
		callback(c as ClassMap[T]);
	} else {
		const waiter = waiting[name];
		if (waiter) {
			waiter[0].then((c) => callback(c as ClassMap[T]));
		} else {
			const prom = new Promise<ClassMap[keyof ClassMap]>((resolve) => {
				waiting[name] = [prom, resolve];
			});
			const waiter = waiting[name] as [Promise<ClassMap[keyof ClassMap]>, (c: ClassMap[keyof ClassMap]) => void];
			waiter[0] = prom;
			prom.then((c) => callback(c as ClassMap[T]));
		}
	}
}

export function lazyRegister<T extends keyof ClassMap>(name: T, c: ClassMap[T]): void {
	classes[name] = c;
	const waiter = waiting[name];
	if (waiter) {
		waiter[1](c);
	}
}
