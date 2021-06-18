// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Unit {}
class UnitClass {}

export function unit(): Unit {
	return new UnitClass();
}

const unitMeta = UnitClass as LuaMetatable<Unit>;
unitMeta.__eq = () => false;
unitMeta.__tostring = () => "()";
const unitSuperMeta = getmetatable(UnitClass) as LuaMetatable<Unit>;
unitSuperMeta.__index = () => error("Attempt to index Unit", 2);
