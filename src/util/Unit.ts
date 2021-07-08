// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UnitType {}

const unitMeta: LuaMetatable<UnitType> = {};
unitMeta.__eq = () => true;
unitMeta.__tostring = () => "()";
unitMeta.__index = () => error("Attempt to index Unit", 2);

export function unit(): UnitType {
	return setmetatable({}, unitMeta);
}
