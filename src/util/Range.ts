export type Range = [number?, number?];
export function resolveRange(r: Range, max: number): Required<Range> {
	return [r[0] ?? 0, r[1] ?? max];
}
