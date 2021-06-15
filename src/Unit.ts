export class Unit {}

const unitMeta = getmetatable(Unit) as LuaMetatable<Unit>;
unitMeta.__eq = () => false;
unitMeta.__tostring = () => "()";
unitMeta.__index = () => error("Attempt to index Unit", 2);
