import { isFixedXY, rangeOrPointToRange, sliceXYRange } from "./helpers_point";
import {
    CellRole,
    Domain,
    DomainDecl,
    DomainTable,
    XYPoint,
    XYRange,
    XYRangeOrPoint
} from "./types";

export function isDomainAnalog(domain: Domain) {
    return domain.props.role === CellRole.Analog;
}

export function isDomainMinus(domain: Domain) {
    return domain.props.role === CellRole.Minus;
}

export function isDomainPlus(domain: Domain) {
    return domain.props.role === CellRole.Plus;
}
