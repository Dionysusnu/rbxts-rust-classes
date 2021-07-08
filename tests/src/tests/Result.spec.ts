/// <reference types="@rbxts/testez/globals" />
declare function itFIXME(phrase: string, callback: () => void): void;

import { Option, Result, unit } from "@rbxts/rust-classes";

export = () => {
	it("Result.__eq", () => {
		expect(Result.ok(1)).to.equal(Result.ok(1));
		expect(Result.err(1)).to.equal(Result.err(1));
		expect(Result.ok(Option.some(1))).to.equal(Result.ok(Option.some(1)));
		expect(Result.err(Option.some(1))).to.equal(Result.err(Option.some(1)));
		expect(Result.ok(Option.some(1))).never.to.equal(Result.ok(Option.none()));
		expect(Result.err(Option.some(1))).never.to.equal(Result.err(Option.none()));
		expect(Result.ok<number, number>(1)).never.to.equal(Result.err(1));
		expect(Result.err<number, number>(1)).never.to.equal(Result.ok(1));
	});
	it("Result.ok", () => {
		expect(Result.ok<number, number>(1).isOk()).to.equal(true);
		expect(Result.ok<number, number>(1).isErr()).to.equal(false);
	});
	it("Result.err", () => {
		expect(Result.err<number, number>(1).isOk()).to.equal(false);
		expect(Result.err<number, number>(1).isErr()).to.equal(true);
	});
	it("Result.fromCallback", () => {
		expect(Result.fromCallback(() => 1)).to.equal(Result.ok(1));
		const helper = [1];
		expect(Result.fromCallback<defined>(() => error(helper as never))).to.equal(Result.err(Option.some(helper)));
		expect(Result.fromCallback<defined>(() => error(pairs as never))).to.equal(Result.err(Option.some(pairs)));
		expect(Result.fromCallback<number>(() => error())).to.equal(Result.err<number, Option<number>>(Option.none()));
	});
	it("Result.fromVoidCallback", () => {
		expect(Result.fromVoidCallback(() => 1)).to.equal(Result.ok(unit()));
		const helper = [1];
		expect(Result.fromVoidCallback(() => error(helper as never))).to.equal(Result.err(Option.some(helper)));
		expect(Result.fromVoidCallback(() => error(pairs as never))).to.equal(Result.err(Option.some(pairs)));
		expect(Result.fromVoidCallback(() => error())).to.equal(Result.err<number, Option<number>>(Option.none()));
	});
	it("Result.fromPromise", () => {
		expect(Result.fromPromise(new Promise<number>((resolve) => resolve(1))).await()[1]).to.equal(Result.ok(1));
		expect(Result.fromPromise<defined>(new Promise((_resolve, reject) => reject(1 as never))).await()[1]).to.equal(
			Result.err(Option.some(1)),
		);
		expect(
			Result.fromPromise<defined>(new Promise((_resolve, reject) => reject(pairs as never))).await()[1],
		).to.equal(Result.err(Option.some(pairs)));
		expect(Result.fromPromise<defined>(new Promise((_resolve, reject) => reject())).await()[1]).to.equal(
			Result.err<number, Option<number>>(Option.none()),
		);
	});
	it("Result.fromVoidPromise", () => {
		expect(Result.fromVoidPromise(new Promise((resolve) => resolve())).await()[1]).to.equal(Result.ok(unit()));
		expect(Result.fromVoidPromise(new Promise((_resolve, reject) => reject(1 as never))).await()[1]).to.equal(
			Result.err(Option.some(1)),
		);
		expect(Result.fromVoidPromise(new Promise((_resolve, reject) => reject(pairs as never))).await()[1]).to.equal(
			Result.err(Option.some(pairs)),
		);
		expect(Result.fromVoidPromise(new Promise((_resolve, reject) => reject())).await()[1]).to.equal(
			Result.err<number, Option<number>>(Option.none()),
		);
	});
	it("Result.isOk", () => {
		expect(Result.ok(1).isOk()).to.equal(true);
		expect(Result.err(1).isOk()).to.equal(false);
	});
	it("Result.isErr", () => {
		expect(Result.ok(1).isErr()).to.equal(false);
		expect(Result.err(1).isErr()).to.equal(true);
	});
	it("Result.contains", () => {
		expect(Result.ok(1).contains(1)).to.equal(true);
		expect(Result.err(1).contains(1)).to.equal(false);
		expect(Result.ok(1).contains(2)).to.equal(false);
	});
	it("Result.containsErr", () => {
		expect(Result.ok(1).containsErr(1)).to.equal(false);
		expect(Result.err(1).containsErr(1)).to.equal(true);
		expect(Result.err(1).containsErr(2)).to.equal(false);
	});
	it("Result.okOption", () => {
		expect(Result.ok(1).okOption()).to.equal(Option.some(1));
		expect(Result.err(1).okOption()).to.equal(Option.none());
	});
	it("Result.errOption", () => {
		expect(Result.ok(1).errOption()).to.equal(Option.none());
		expect(Result.err(1).errOption()).to.equal(Option.some(1));
	});
	it("Result.map", () => {
		expect(Result.ok(1).map((i) => ++i)).to.equal(Result.ok(2));
		expect(Result.err<number, number>(1).map(() => error("Should not run"))).to.equal(Result.err(1));
	});
	it("Result.mapOr", () => {
		expect(Result.ok(1).mapOr(3, (i) => ++i)).to.equal(2);
		expect(Result.err<number, number>(1).mapOr(3, () => error("Should not run"))).to.equal(3);
	});
	it("Result.mapOrElse", () => {
		expect(
			Result.ok(1).mapOrElse(
				() => error("Should not run"),
				(i) => ++i,
			),
		).to.equal(2);
		expect(
			Result.err<number, number>(1).mapOrElse(
				() => 3,
				() => error("Should not run"),
			),
		).to.equal(3);
	});
	it("Result.mapErr", () => {
		expect(Result.err(1).mapErr((i) => ++i)).to.equal(Result.err(2));
		expect(Result.ok<number, number>(1).mapErr(() => error("Should not run"))).to.equal(Result.ok(1));
	});
	it("Result.and", () => {
		expect(Result.ok(1).and(Result.ok(2))).to.equal(Result.ok(2));
		expect(Result.err(1).and(Result.ok(2))).to.equal(Result.err(1));
		expect(Result.err(1).and(Result.err(2))).to.equal(Result.err(1));
		expect(Result.ok(1).and(Result.err(2))).to.equal(Result.err(2));
	});
	it("Result.andWith", () => {
		expect(Result.ok(1).andWith(() => Result.ok(2))).to.equal(Result.ok(2));
		expect(Result.ok(1).andWith(() => Result.err(2))).to.equal(Result.err(2));
		expect(Result.err(1).andWith(() => error("Should not run"))).to.equal(Result.err(1));
	});
	it("Result.or", () => {
		expect(Result.ok(1).or(Result.ok(2))).to.equal(Result.ok(1));
		expect(Result.err(1).or(Result.ok(2))).to.equal(Result.ok(2));
		expect(Result.err(1).or(Result.err(2))).to.equal(Result.err(2));
		expect(Result.ok(1).or(Result.err(2))).to.equal(Result.ok(1));
	});
	it("Result.orElse", () => {
		expect(Result.err(1).orElse(() => Result.ok(2))).to.equal(Result.ok(2));
		expect(Result.err(1).orElse(() => Result.err(2))).to.equal(Result.err(2));
		expect(Result.ok(1).orElse(() => error("Should not run"))).to.equal(Result.ok(1));
	});
};
