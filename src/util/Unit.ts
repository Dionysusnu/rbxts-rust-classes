export interface UnitType {
	readonly type: unique symbol
}

const unitMeta: LuaMetatable<UnitType> = {};
unitMeta.__eq = () => true;
unitMeta.__tostring = () => "()";
unitMeta.__index = () => error("Attempt to index Unit", 2);

export function unit(): UnitType {
	return setmetatable({}, unitMeta);
}
