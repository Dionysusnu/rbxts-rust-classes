/// <reference types="@rbxts/testez/globals" />

import { Option } from "@rbxts/rust-classes";

export = () => {
	describe("Option.isSome", () => {
		expect(Option.some(1).isSome()).to.be.ok();
	});
};
