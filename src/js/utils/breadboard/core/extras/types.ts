import { AuxPointCategory } from "../Grid";

/**
 * Coordinates in two-dimensional space
 *
 * @category Breadboard
 */
export type XYPoint = { x: number; y: number };
export type XYRange = { from: XYPoint; to: XYPoint };
export type XYRangeOrPoint = XYRange | XYPoint;

/**
 * Direction of the data flow of the pin
 *
 * @category Breadboard
 */
export enum PinState {
    Input = "input",
    Output = "output"
}

export enum DomainSlice {
    Vertical = "vert",
    Horizontal = "horz"
}

export type EmbeddedPlate = {
    type: string;
    id: number;
    position: {
        cells: XYPoint[];
    };
    properties: { [key: string]: string | number };
    pin_state_initial?: PinState;
};

export type DomainTable = {
    [id: number]: Domain;
};

/**
 * Group of interconnected cells
 *
 * It's usually represented as the non-diagonal contact line.
 * It can have different visual styles, which can be adusted through the parameters
 * of this method.
 *
 * @category Breadboard
 */
export type Domain = {
    field: XYRange;
    virtual?: XYRange;
    minus?: (i: number, point: XYPoint) => XYPoint;
    /* TODO: Narrow types 'style' and 'role' */
    props?: DomainProps;
};

/**
 * User-side declaration of {@link Domain}
 */
export type DomainDecl = {
    field: XYRangeOrPoint;
    virtual?: XYRange;
    minus?: (i: number, point: XYPoint) => XYPoint;
    slice?: DomainSlice;
    props?: DomainProps;
};

export type DomainProps = {
    style?: string;
    role?: CellRole;
    value_orientation?: string;
    bias_inv?: boolean;
    no_labels?: boolean;
    pins_from?: number;
    pins_to?: number;
    line_after?: number;
    line_before?: number;
    pin_state_initial?: PinState;
    label_pos?: "top" | "bottom" | "left" | "right";
};

/**
 * Board cell topology
 *
 * @category Breadboard
 */
export type Layout = {
    /** size of the total board workspace ({@link Grid} wrap) */
    wrap: { x: number; y: number };
    /** size of the matrix */
    size: { x: number; y: number };

    /** gaps between cells */
    gap: XYPoint;
    /** number of rows & cols of the matrix */
    dim: XYPoint;
    /** geometric position of the matrix */
    pos: XYPoint;

    ddecls?: DomainDecl[];
    aux_point_cats?: AuxPointCategory[];
    controls?: { horz: boolean };

    curr_straight_top_y?: number;
    curr_straight_bottom_y?: number;

    plate_style?: {
        label_font_size?: number;
        quad_size?: number;
        led_size?: number;
    };
    label_style?: { font_size: number; text_bias: number; led_size?: number };
};

/**
 *
 *
 * @category Breadboard
 */
export enum Direction {
    Up,
    Right,
    Down,
    Left
}

/**
 *
 * @category Breadboard
 */
export enum CellRole {
    Plus = "plus",
    Minus = "minus",
    Analog = "analog",
    None = "none"
}

/**
 *
 *
 * @category Breadboard
 */
export const DirsClockwise = [
    Direction.Up,
    Direction.Right,
    Direction.Down,
    Direction.Left
];
