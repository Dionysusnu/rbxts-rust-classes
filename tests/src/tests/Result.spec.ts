/// <reference types="@rbxts/testez/globals" />

import { Option, Result } from "@rbxts/rust-classes";

export = () => {
	it("Result.===", () => {
		expect(Result.ok(1) === Result.ok(1)).to.equal(true);
		expect(Result.err(1) === Result.err(1)).to.equal(true);
		expect(Result.ok(Option.some(1)) === Result.ok(Option.some(1))).to.equal(true);
		expect(Result.err(Option.some(1)) === Result.err(Option.some(1))).to.equal(true);
		expect(Result.ok(Option.some(1)) === Result.ok(Option.none())).to.equal(false);
		expect(Result.err(Option.some(1)) === Result.err(Option.none())).to.equal(false);
		expect(Result.ok<number, number>(1) === Result.err(1)).to.equal(false);
		expect(Result.err<number, number>(1) === Result.ok(1)).to.equal(false);
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
	it("Result.isOk", () => {
		expect(Result.ok(1).isOk()).to.equal(true);
		expect(Result.err(1).isOk()).to.equal(false);
	});
};
