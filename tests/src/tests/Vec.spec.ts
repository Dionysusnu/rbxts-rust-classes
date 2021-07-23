/// <reference types="@rbxts/testez/globals" />

import { Vec } from "@rbxts/rust-classes";

export = () => {
	it("Vec.i", () => {
		expect(Vec.vec(1, 2).i(0)).to.equal(1);
		expect(Vec.vec(1, 2).i(1)).to.equal(2);
		expect(() => Vec.vec(1, 2).i(2)).to.throw();
		expect(() => Vec.vec(1, 2).i(-1)).to.throw();
	});
	it("Vec.truncate", () => {
		const helper = Vec.vec(1, 2).truncate(1);
		expect(helper.len()).to.equal(1);
		expect(helper.i(0)).to.equal(1);
		expect(Vec.vec(1, 2).truncate(2).len()).to.equal(2);
		expect(Vec.vec(1, 2).truncate(3).len()).to.equal(2);
	});
	it("Vec.asPtr", () => {
		const helper = [1, 2];
		expect(Vec.fromPtr(helper).asPtr()).to.equal(helper);
	});
	it("Vec.setLen", () => {
		expect(Vec.vec(1, 2).setLen(3).len()).to.equal(3);
	});
	it("Vec.swapRemove", () => {
		const helper = Vec.vec(1, 2, 3, 4);
		expect(helper.swapRemove(1)).to.equal(2);
		expect(helper.len()).to.equal(3);
		expect(helper.i(0)).to.equal(1);
		expect(helper.i(1)).to.equal(4);
		expect(helper.i(2)).to.equal(3);
	});
	it("Vec.insert", () => {
		const helper = Vec.vec(1, 3);
		helper.insert(1, 2);
		expect(helper.len()).to.equal(3);
		expect(helper.i(0)).to.equal(1);
		expect(helper.i(1)).to.equal(2);
		expect(helper.i(2)).to.equal(3);
	});
	it("Vec.remove", () => {
		const helper = Vec.vec(1, 2, 3, 4);
		expect(helper.remove(1)).to.equal(2);
		expect(helper.len()).to.equal(3);
		expect(helper.i(0)).to.equal(1);
		expect(helper.i(1)).to.equal(3);
		expect(helper.i(2)).to.equal(4);
	});
	it("Vec.retain", () => {
		const helper = Vec.vec(1, 2, 3, 4, 5, 6, 7);
		helper.retain((e) => e % 2 === 0);
		expect(helper.len()).to.equal(3);
		expect(helper.i(0)).to.equal(2);
		expect(helper.i(1)).to.equal(4);
		expect(helper.i(2)).to.equal(6);
		const helper2 = Vec.vec(1, 2, 3, 4, 5, 6, 7);
		helper2.retain((e) => e % 2 !== 0);
		expect(helper2.len()).to.equal(4);
		expect(helper2.i(0)).to.equal(1);
		expect(helper2.i(1)).to.equal(3);
		expect(helper2.i(2)).to.equal(5);
		expect(helper2.i(3)).to.equal(7);
		expect(
			Vec.vec(1, 2, 3, 4, 5, 6, 7)
				.retain((e) => e % 2 !== 0)
				.retain((e) => e % 2 === 0)
				.len(),
		).to.equal(0);
	});
};
