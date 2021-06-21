/// <reference types="@rbxts/testez/globals" />

import { Option } from "@rbxts/rust-classes";

export = () => {
	it("Option.isSome", () => {
		expect(Option.some(1).isSome()).to.equal(true);
		expect(Option.none().isSome()).to.equal(false);
		expect(Option.wrap(1).isSome()).to.equal(true);
		expect(Option.wrap(undefined).isSome()).to.equal(false);
	});
	it("Option.isNone", () => {
		expect(Option.some(1).isNone()).to.equal(false);
		expect(Option.none().isNone()).to.equal(true);
		expect(Option.wrap(1).isNone()).to.equal(false);
		expect(Option.wrap(undefined).isNone()).to.equal(true);
	});
};
