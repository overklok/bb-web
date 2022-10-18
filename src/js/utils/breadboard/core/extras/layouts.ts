import { DomainSchematicStyle } from "../../layers/ContactLayer";
import { AuxPointCategory } from "../Grid";
import { CellRole, DomainSlice, Layout } from "./types";

/**
 *
 *
 * @category Breadboard
 */
export const LAYOUTS: { [key: string]: Layout } = {
    v5x: {
        plate_style: {
            label_font_size: 16
        },

        label_style: {
            font_size: 28,
            text_bias: 14
        },

        wrap: { x: 1200, y: 1350 },
        size: { x: 1000, y: 1100 },
        gap: { x: 20, y: 20 },
        dim: { x: 10, y: 11 },
        pos: { x: 120, y: 200 },

        ddecls: [
            // Линия аналоговых пинов
            {
                slice: DomainSlice.Horizontal,
                field: { from: { x: 0, y: 0 }, to: { x: -1, y: 0 } },
                minus: (i, point) => ({ x: point.x, y: -1 }),
                props: {
                    style: DomainSchematicStyle.None,
                    role: CellRole.Analog,
                    value_orientation: "north"
                }
            },

            // Верхняя линия "+"
            {
                slice: DomainSlice.Horizontal,
                field: { from: { x: 0, y: 1 }, to: { x: -1, y: 1 } },
                props: {
                    bias_inv: true,
                    role: CellRole.Plus,
                    no_labels: true
                }
            },

            // Нижняя линия "-"
            {
                slice: DomainSlice.Horizontal,
                field: { from: { x: 0, y: -1 }, to: { x: -1, y: -1 } },
                props: {
                    role: CellRole.Minus,
                    no_labels: true
                }
            },

            // Две группы вертикальных линий
            {
                slice: DomainSlice.Vertical,
                field: { from: { x: 0, y: 2 }, to: { x: -1, y: 5 } }
            },
            {
                slice: DomainSlice.Vertical,
                field: { from: { x: 0, y: 6 }, to: { x: -1, y: 9 } }
            }
        ],

        aux_point_cats: [AuxPointCategory.SourceV5],

        controls: { horz: true },

        // TODO: сделать универсальный формат
        // Y-координата верхней линии, где рисовать прямые токи
        curr_straight_top_y: 1,
        curr_straight_bottom_y: -1
    }
};
