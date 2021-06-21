/// <reference types="@rbxts/testez/globals" />

import { Option, OptionMut } from "@rbxts/rust-classes";

export = () => {
	it("OptionMut.iter", () => {
		const some = OptionMut.some(1);
		expect(some.iter().sizeHint()[0]).to.equal(1);
		expect(some.iter().sizeHint()[1]).to.equal(Option.some(1));
		expect(some.iter().nextItem()).to.equal(Option.some(1));
		expect(some).to.equal(OptionMut.none());
		const none = OptionMut.none();
		expect(none.iter().sizeHint()[0]).to.equal(0);
		expect(none.iter().sizeHint()[1]).to.equal(Option.some(0));
		expect(none.iter().nextItem()).to.equal(Option.none());
		expect(none).to.equal(OptionMut.none());
	});
	it("OptionMut.insert", () => {
		const a = OptionMut.some(1);
		expect(a.insert(2)).to.equal(2);
		expect(a).to.equal(OptionMut.some(2));
		const b = OptionMut.none();
		expect(b.insert(2)).to.equal(2);
		expect(b).to.equal(OptionMut.some(2));
	});
	it("OptionMut.getOrInsert", () => {
		const a = OptionMut.some(1);
		expect(a.getOrInsert(2)).to.equal(1);
		expect(a).to.equal(OptionMut.some(1));
		const b = OptionMut.none();
		expect(b.getOrInsert(2)).to.equal(2);
		expect(b).to.equal(OptionMut.some(2));
	});
	it("OptionMut.getOrInsertWith", () => {
		const a = OptionMut.some(1);
		expect(a.getOrInsertWith(() => error("Will not run"))).to.equal(1);
		expect(a).to.equal(OptionMut.some(1));
		const b = OptionMut.none();
		expect(b.getOrInsertWith(() => 2)).to.equal(2);
		expect(b).to.equal(OptionMut.some(2));
	});
	it("OptionMut.take", () => {
		const a = OptionMut.some(1);
		expect(a.take()).to.equal(Option.some(1));
		expect(a).to.equal(OptionMut.none());
		const b = OptionMut.none();
		expect(b.take()).to.equal(Option.none());
		expect(b).to.equal(OptionMut.none());
	});
	it("OptionMut.replace", () => {
		const a = OptionMut.some(1);
		expect(a.replace(2)).to.equal(Option.some(1));
		expect(a).to.equal(OptionMut.some(2));
		const b = OptionMut.none();
		expect(b.replace(2)).to.equal(Option.none());
		expect(b).to.equal(OptionMut.some(2));
	});
};
