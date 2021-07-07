/// <reference types="@rbxts/testez/globals" />

import { Option, Result } from "@rbxts/rust-classes";

export = () => {
	it("Result.===", () => {
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
		expect(Result.fromCallback(() => 1) === Result.ok(1)).to.equal(true);
		expect(Result.fromCallback(() => 1) === Result.err<number, Option<number>>(Option.some(1))).to.equal(false);
		expect(Result.fromCallback<defined>(() => error(pairs as never)) === Result.err(Option.some(pairs))).to.equal(
			true,
		);
		expect(
			Result.fromCallback<number>(() => error()) === Result.err<number, Option<number>>(Option.none()),
		).to.equal(true);
	});
	it("Result.fromPromise test", () => {
		print("awaiting 1");
		print(Promise.resolve(Result.ok(1)).await());
		print("awaiting 2");
		print(Promise.resolve(Result.err(2)).await());
		print("awaiting 3");
		print(Promise.resolve(3).await());
		expect(true).equal(true);
	});
	it("Result.fromPromise", () => {
		expect(Result.fromPromise(new Promise<number>((resolve) => resolve(1))).await()[1]).to.equal(Result.ok(1));
		expect(Result.fromPromise(new Promise<number>((resolve) => resolve(1))).await()[1]).never.to.equal(
			Result.err<number, Option<number>>(Option.some(1)),
		);
		expect(Result.fromPromise<defined>(new Promise(() => error(pairs as never))).await()[1]).to.equal(
			Result.err(Option.some(pairs)),
		);
		expect(Result.fromPromise<defined>(new Promise(() => error())).await()[1]).to.equal(
			Result.err<number, Option<number>>(Option.none()),
		);
	});
	it("Result.isOk", () => {
		expect(Result.ok(1).isOk()).to.equal(true);
		expect(Result.err(1).isOk()).to.equal(false);
	});
};
