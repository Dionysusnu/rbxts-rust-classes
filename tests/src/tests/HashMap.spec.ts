/// <reference types="@rbxts/testez/globals" />

import { HashMap, Entry } from "@rbxts/rust-classes";

export = () => {
	it("HashMap.__tostring", () => {
		const helper = HashMap.empty();
		helper.insert(1, 2);
		helper.insert(3, 4);
		expect(tostring(helper)).to.equal("HashMap{(1, 2), (3, 4)}");
	});
	it("HashMap.i", () => {
		const helper = HashMap.empty();
		helper.insert(1, 2);
		expect(helper.i(1)).to.equal(2);
		expect(() => HashMap.empty().i(1)).to.throw();
		expect(() => HashMap.empty().i(-1)).to.throw();
	});
};
