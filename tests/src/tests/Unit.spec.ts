/// <reference types="@rbxts/testez/globals" />

import { unit } from "@rbxts/rust-classes";

export = () => {
	it("Unit.__tostring", () => {
		expect(tostring(unit())).to.equal("()");
	});
	it("Unit.__eq", () => {
		expect(unit()).to.equal(unit());
		expect(unit()).never.to.equal(1);
		expect(1).never.to.equal(unit());
	});
	it("Unit.__index", () => {
		expect(() => (unit() as { index: unknown }).index).to.throw();
	});
};
