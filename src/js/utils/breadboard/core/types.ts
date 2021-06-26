export type XYObject = { x: number, y: number }

export type Domain = {
    horz: boolean,
    from: XYObject,
    to: XYObject
    minus_from?: XYObject,
    minus_to?: XYObject,
    /* TODO: Narrow types 'style' and 'role' */
    style?: string,
    role?: string,
    value_orientation?: string,
    bias_inv?: boolean,
    no_labels?: boolean,
    virtual?: {from: number, to: number}
}

/* TODO: Narrow type 'Point' */
type Point = string;

export type Layout = {
    plate_style?: { label_font_size: number },
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

export const enum Direction {
    Up,
    Right,
    Down,
    Left,
}

export const DirsClockwise = [Direction.Up, Direction.Right, Direction.Down, Direction.Left];