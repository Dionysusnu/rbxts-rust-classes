/// <reference types="@rbxts/testez/globals" />

import { Option, Result } from "@rbxts/rust-classes";

export = () => {
	it("Option.===", () => {
		expect(Option.some(1)).to.equal(Option.some(1));
		expect(Option.none()).never.to.equal(Option.some(1));
		expect(Option.some(1)).never.to.equal(Option.none());
		expect(Option.wrap(1)).to.equal(Option.wrap(1));
		expect(Option.wrap(undefined)).never.to.equal(Option.wrap(1));
		expect(Option.wrap(1)).never.to.equal(Option.wrap(undefined));
	});
	it("Option.none", () => {
		expect(Option.none().isNone()).to.equal(true);
		expect(Option.none().isSome()).to.equal(false);
	});
	it("Option.some", () => {
		expect(Option.some(1).isNone()).to.equal(false);
		expect(Option.some(1).isSome()).to.equal(true);
	});
	it("Option.wrap", () => {
		expect(Option.wrap(undefined).isNone()).to.equal(true);
		expect(Option.wrap(1).isSome()).to.equal(true);
	});
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
	it("Option.contains", () => {
		expect(Option.some(1).contains(1)).to.equal(true);
		expect(Option.some(1).contains(0)).to.equal(false);
		expect(Option.none().contains(1)).to.equal(false);
	});
	it("Option.expect", () => {
		expect(Option.some(1).expect("Not throw")).to.equal(1);
		expect(() => Option.none().expect("Throw")).to.throw();
		expect(Option.some(1).expect(undefined)).to.equal(1);
		expect(() => Option.none().expect(undefined)).to.throw();
	});
	it("Option.unwrap", () => {
		expect(Option.some(1).unwrap()).to.equal(1);
		expect(() => Option.none().unwrap()).to.throw();
	});
	it("Option.unwrapOr", () => {
		expect(Option.some(1).unwrapOr(0)).to.equal(1);
		expect(Option.none().unwrapOr(0)).to.equal(0);
	});
	it("Option.unwrapOrElse", () => {
		expect(Option.some(1).unwrapOrElse(() => 0)).to.equal(1);
		expect(Option.none().unwrapOrElse(() => 0)).to.equal(0);
	});
	it("Option.map", () => {
		expect(Option.some(1).map((i) => ++i)).to.equal(Option.some(2));
		expect(Option.none<number>().map((i) => ++i)).to.equal(Option.none());
	});
	it("Option.mapOr", () => {
		expect(Option.some(1).mapOr(0, (i) => ++i)).to.equal(2);
		expect(Option.none<number>().mapOr(0, (i) => ++i)).to.equal(0);
	});
	it("Option.mapOrElse", () => {
		expect(
			Option.some(1).mapOrElse(
				() => error("Will not run"),
				(i) => ++i,
			),
		).to.equal(2);
		expect(
			Option.none<number>().mapOrElse(
				() => 0,
				(i) => ++i,
			),
		).to.equal(0);
	});
	it("Option.okOr", () => {
		expect(Option.some(1).okOr(2)).to.equal(Result.ok(1));
		expect(Option.none<number>().okOr(2)).to.equal(Result.err(2));
	});
	it("Option.okOrElse", () => {
		expect(Option.some(1).okOrElse(() => error("Will not run"))).to.equal(Result.ok(1));
		expect(Option.none<number>().okOrElse(() => 2)).to.equal(Result.err(2));
	});
	it("Option.and", () => {
		expect(Option.some(1).and(Option.some(2))).to.equal(Option.some(2));
		expect(Option.none().and(Option.some(2))).to.equal(Option.none());
		expect(Option.none().and(Option.none())).to.equal(Option.none());
		expect(Option.some(1).and(Option.none())).to.equal(Option.none());
	});
	it("Option.andThen", () => {
		expect(Option.some(1).andThen(() => Option.some(2))).to.equal(Option.some(2));
		expect(Option.some(1).andThen(() => Option.none())).to.equal(Option.none());
		expect(Option.none().andThen(() => error("Will not run"))).to.equal(Option.none());
	});
	it("Option.filter", () => {
		expect(Option.some(1).filter(() => true)).to.equal(Option.some(1));
		expect(Option.some(1).filter(() => false)).to.equal(Option.none());
		expect(Option.none().filter(() => true)).to.equal(Option.none());
		expect(Option.none().filter(() => false)).to.equal(Option.none());
	});
	it("Option.or", () => {
		expect(Option.some(1).or(Option.some(2))).to.equal(Option.some(1));
		expect(Option.none().or(Option.some(2))).to.equal(Option.some(2));
		expect(Option.none().or(Option.none())).to.equal(Option.none());
		expect(Option.some(1).or(Option.none())).to.equal(Option.some(1));
	});
	it("Option.orElse", () => {
		expect(Option.some(1).orElse(() => error("Will not run"))).to.equal(Option.some(1));
		expect(Option.none().orElse(() => Option.some(2))).to.equal(Option.some(2));
		expect(Option.none().orElse(() => Option.none())).to.equal(Option.none());
	});
	it("Option.xor", () => {
		expect(Option.some(1).xor(Option.some(2))).to.equal(Option.none());
		expect(Option.none().xor(Option.some(2))).to.equal(Option.some(2));
		expect(Option.none().xor(Option.none())).to.equal(Option.none());
		expect(Option.some(1).xor(Option.none())).to.equal(Option.some(1));
	});
	it("Option.zip", () => {
		expect(Option.some(1).zip(Option.some("string")).unwrap()[0]).to.equal(1);
		expect(Option.some(1).zip(Option.some("string")).unwrap()[1]).to.equal("string");
		expect(Option.none().zip(Option.some("string"))).to.equal(Option.none());
		expect(Option.none().zip(Option.none())).to.equal(Option.none());
		expect(Option.some(1).zip(Option.none())).to.equal(Option.none());
	});
	it("Option.zipWith", () => {
		expect(
			Option.some(1)
				.zipWith(Option.some("string"), (a, b) => [b, a] as const)
				.unwrap()[0],
		).to.equal("string");
		expect(
			Option.some(1)
				.zipWith(Option.some("string"), (a, b) => [b, a] as const)
				.unwrap()[1],
		).to.equal(1);
		expect(Option.none().zipWith(Option.some("string"), () => error("Will not run"))).to.equal(Option.none());
		expect(Option.none().zipWith(Option.none(), () => error("Will not run"))).to.equal(Option.none());
		expect(Option.some(1).zipWith(Option.none(), () => error("Will not run"))).to.equal(Option.none());
	});
	it("Option.copied", () => {
		expect(Option.some(1)).to.equal(Option.some(1));
		expect(Option.none()).to.equal(Option.none());
	});
	it("Option.transpose", () => {
		expect(Option.none<Result<number, string>>().transpose()).to.equal(Result.ok(Option.none()));
		expect(Option.some(Result.ok(1)).transpose()).to.equal(Result.ok(Option.some(1)));
		expect(Option.some(Result.err("string")).transpose()).to.equal(Result.err("string"));
	});
	it("Option.flatten", () => {
		expect(Option.some(Option.some(1)).flatten()).to.equal(Option.some(1));
		expect(Option.some(Option.none()).flatten()).to.equal(Option.none());
		expect(Option.none<Option<number>>().flatten()).to.equal(Option.none());
	});
	it("Option.match", () => {
		expect(
			Option.some(1).match(
				() => 2,
				() => error("Will not run"),
			),
		).to.equal(2);
		expect(
			Option.none().match(
				() => error("Will not run"),
				() => 3,
			),
		).to.equal(3);
	});
	it("Option.asPtr", () => {
		expect(Option.some(1).asPtr()).to.equal(1);
		expect(Option.none().asPtr()).to.equal(undefined);
	});
};
