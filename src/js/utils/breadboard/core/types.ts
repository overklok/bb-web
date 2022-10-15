/**
 * Coordinates in two-dimensional space
 * 
 * @category Breadboard
 */
export type XYObject = { x: number, y: number }

/**
 * Direction of the data flow of the pin
 * 
 * @category Breadboard
 */
export enum PinState {
    Input = "input",
    Output = "output"
}

/**
 * Group of interconnected cells (separate contact line)
 * 
 * Domain is a group of interconnected cells. 
 * It's usually represented as the non-diagonal contact line.
 * It can have different visual styles, which can be adusted through the parameters
 * of this method.
 * 
 * TODO: describe each property 
 * 
 * @category Breadboard
 */
export type Domain = {
    horz: boolean,
    from: XYObject,
    to: XYObject
    minus?: XYObject
    minus_from?: XYObject,
    minus_to?: XYObject,
    /* TODO: Narrow types 'style' and 'role' */
    style?: string,
    role?: CellRole,
    value_orientation?: string,
    bias_inv?: boolean,
    no_labels?: boolean,
    virtual?: { from: XYObject, to: XYObject },
    label_pos?: "top" | "bottom" | "left" | "right",
    pins_from?: number,
    pins_to?: number,
    line_after?: number,
    line_before?: number,
    pin_state_initial?: PinState,
}

/* TODO: Narrow type 'Point' */

/**
 * 
 * 
 * @category Breadboard
 */
type Point = string;

/**
 * Board cell topology
 * 
 * @category Breadboard
 */
export type Layout = {
    plate_style?: { label_font_size?: number, quad_size?: number },
    label_style?: { font_size: number, text_bias: number },
    wrap_width: number,
    wrap_height: number,
    grid_width: number,
    grid_height: number,
    grid_gap_x: number,
    grid_gap_y: number,
    grid_rows: number,
    grid_cols: number,
    grid_pos_x: number,
    grid_pos_y: number,
    domains: Domain[],
    points: Point[],
    controls: { horz: boolean },
    curr_straight_top_y: number,
    curr_straight_bottom_y: number
}

/**
 * 
 * 
 * @category Breadboard
 */
export enum Direction {
    Up,
    Right,
    Down,
    Left,
}

/**
 * 
 * @category Breadboard
 */
export enum CellRole {
    Plus = 'plus',
    Minus = 'minus',
    Analog = 'analog',
    None = 'none'
}

/**
 * 
 * 
 * @category Breadboard
 */
export const DirsClockwise = [Direction.Up, Direction.Right, Direction.Down, Direction.Left];