import { XYPoint, XYRange, DomainSlice, XYRangeOrPoint } from "./types";

export function* sliceXYRange(range: XYRange, slice?: DomainSlice): Generator<XYRange> {
    const { from, to } = range;

    let dyn_min, dyn_max;

    // if (range.from.x === range.to.x && range.from.y === range.to.y) return { from, to };
    if (!slice) return { from, to };

    if (slice === DomainSlice.Horizontal) {
        [dyn_min, dyn_max] = [from.y, to.y];
    } else {
        [dyn_min, dyn_max] = [from.x, to.x];
    }

    [dyn_min, dyn_max] = minmax(dyn_min, dyn_max);

    for (let dyn = dyn_min; dyn <= dyn_max; dyn++) {
        let _from, _to;

        if (slice === DomainSlice.Horizontal) {
            _from = { x: from.x, y: dyn };
            _to = { x: to.x, y: dyn };
        } else {
            _from = { x: dyn, y: from.y };
            _to = { x: dyn, y: to.y };
        }

        yield { from: _from, to: _to };
    }
}

/**
 * Generates sequence of points lying on the same axis (x or y) in ascending order
 *
 * You can substitute the original fixed axis value,
 * which stays the same for the each object
 * to customize the sequence.
 *
 * If p_from.x === p_to.y, the fixed axis is X
 * If p_from.y === p_to.y, the fixed axis is Y
 *
 * @param p_from    first and last points of the sequence (included)
 * @param fix_subst fixed axis value substitutor
 */
export function* pointseq(range: XYRange, fix_subst?: number) {
    if (isFixedXY(range)) {
        // X is fixed
        for (const y of numseq(range.from.y, range.to.y)) yield { x: fix_subst || range.to.x, y };
    } else {
        // Y is fixed
        for (const x of numseq(range.from.x, range.to.x)) yield { x, y: fix_subst || range.to.y };
    }
}

export function* countseq<V>(count: number, value: V) {
    for (let i = 0; i < count; i++) yield value;
}

/**
 * Generates sequence of numbers in given range in acsending order
 *
 * @param from first number of the sequence (included)
 * @param to   last number of the sequence (included)
 */
export function* numseq(from: number, to: number) {
    [from, to] = [Math.min(from, to), Math.max(from, to)];

    for (let i = from; i <= to; i++) {
        yield i;
    }
}

export function rangeOrPointToRange(point_or_range: XYRangeOrPoint): XYRange {
    if (point_or_range.hasOwnProperty("x")) {
        return {
            from: point_or_range as XYPoint,
            to: point_or_range as XYPoint
        };
    }

    return point_or_range as XYRange;
}

export function minmaxfix(r: XYRange): [number, number] {
    if (isFixedXY(r)) {
        return [Math.min(r.from.x, r.to.x), Math.max(r.from.x, r.to.x)];
    } else {
        return [Math.min(r.from.y, r.to.y), Math.max(r.from.y, r.to.y)];
    }
}

export function minmaxdyn(r: XYRange): [number, number] {
    if (!isFixedXY(r)) {
        return [Math.min(r.from.x, r.to.x), Math.max(r.from.x, r.to.x)];
    } else {
        return [Math.min(r.from.y, r.to.y), Math.max(r.from.y, r.to.y)];
    }
}

export function fixXY(range: XYRange): number {
    if (isFixedXY(range)) {
        return range.from.x;
    } else {
        return range.from.y;
    }
}

export function isFixedXY(range: XYRange) {
    if (range.from.x === range.to.x) return true;
    else if (range.from.y === range.to.y) return false;

    throw Error("Points are placed on different axes");
}

export function minmax(v1: number, v2: number): [number, number] {
    return [Math.min(v1, v2), Math.max(v1, v2)];
}
