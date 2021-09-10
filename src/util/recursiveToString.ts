export function recursiveToString(t: unknown, indent = "") {
	if (typeIs(t, "table")) {
		let buffer = "";
		buffer += "{";

		for (const [k, v] of pairs(t)) {
			if (typeIs(k, "string")) {
				buffer += " " + indent + k + ": " + recursiveToString(v, " " + indent);
			}
		}

		buffer += indent + " }";
		return buffer;
	} else return tostring(t);
}