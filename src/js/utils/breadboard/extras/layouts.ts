import BackgroundLayer from "../layers/BackgroundLayer";
import LabelLayer from "../layers/LabelLayer";
import Grid, { AuxPointCategory } from "../core/Grid";
import { Layout } from "../core/types";

const ARD_GND_Y = -144;

export const LAYOUTS: {[key: string]: Layout} = {
    v8x: {
        plate_style: {
            label_font_size: 16,
            quad_size: 18,
        },

        label_style: {
            font_size: 20,
            text_bias: 10,
        },

        wrap_width:     850,  // Ширина рабочей области
        wrap_height:    1300, // Высота рабочей области

        grid_width:     560,
        grid_height:    1140,

        grid_gap_x:     10,
        grid_gap_y:     10,

        grid_rows:      16,   // Количество рядов в сетке точек
        grid_cols:      8,   // Количество колонок в сетке точек

        grid_pos_x:     190,
        grid_pos_y:     90,

        domains: [
            // Верхняя линия
            {
                horz: true, from: {x: 0, y: 0}, to: {x: 3, y: 0},
                role: LabelLayer.CellRoles.Plus, bias_inv: true,
                label_pos: "top",
            },
            {
                horz: true,
                from: {x: 4, y: 0}, to: {x: -1, y: 0},
                minus_from: {x: 0, y: ARD_GND_Y}, minus_to: {x: 3, y: ARD_GND_Y},
                role: LabelLayer.CellRoles.Analog,
                style: BackgroundLayer.DomainSchematicStyles.Dotted,
                pins_from: 0, bias_inv: true,
                line_before: 1,
                label_pos: "top",
                value_orientation: 'north',
                pin_state_initial: "input"
            },

            // Одиночные контакты - аналоговые пины
            {
                horz: false,
                from: {x: -1, y: 4}, to: {x: -1, y: 4},
                minus: {x: 4, y: ARD_GND_Y},
                role: LabelLayer.CellRoles.Analog, pins_from: 4,
                value_orientation: 'east',
            },
            {
                horz: false,
                from: {x: -1, y: 5}, to: {x: -1, y: 5},
                minus: {x: 5, y: ARD_GND_Y},
                role: LabelLayer.CellRoles.Analog, pins_from: 5,
                value_orientation: 'east',
            },
            {
                horz: false,
                from: {x: -1, y: 10}, to: {x: -1, y: 10},
                minus: {x: 6, y: ARD_GND_Y},
                role: LabelLayer.CellRoles.Analog, pins_from: 6,
                value_orientation: 'east',
            },
            {
                horz: false,
                from: {x: -1, y: 11}, to: {x: -1, y: 11},
                minus: {x: 7, y: ARD_GND_Y},
                role: LabelLayer.CellRoles.Analog, pins_from: 7,
                value_orientation: 'east',
            },

            // Нижняя линия
            {
                horz: true,
                from: {x: 0, y: 15}, to: {x: 3, y: 15},
                role: LabelLayer.CellRoles.Minus,
                label_pos: "bottom",
                virtual: {
                    // Arduino plate ground pins that analog cells are mapped to
                    from: {x: 0, y: ARD_GND_Y}, to: {x: 11, y: ARD_GND_Y}
                },
            },
            {
                horz: true,
                from: {x: -1, y: 15}, to: {x: 4, y: 15},
                minus_from: {x: 8, y: ARD_GND_Y}, minus_to: {x: 11, y: ARD_GND_Y},
                role: LabelLayer.CellRoles.Analog,
                style: BackgroundLayer.DomainSchematicStyles.Dotted,
                pins_to: 11,
                line_before: 1,
                label_pos: "bottom",
                value_orientation: 'south',
                pin_state_initial: "output"
            },

            // Три группы вертикальных линий
            {horz: false, from: {x: 0, y: 1},   to: {x: -2, y: 5}},
            {horz: false, from: {x: 0, y: 6},   to: {x: -2, y: 9}},
            {horz: false, from: {x: 0, y: 10},  to: {x: -2, y: 14}},

            // Тройные линии в верхней и нижней группах
            {horz: false, from: {x: -1, y: 1},  to: {x: -1, y: 3}},
            {horz: false, from: {x: -1, y: 12}, to: {x: -1, y: 14}},

            // Двойные линии в средней группе
            {horz: false, from: {x: -1, y: 8},  to: {x: -1, y: 9}},
            {horz: false, from: {x: -1, y: 6},  to: {x: -1, y: 7}},
        ],

        points: [
            AuxPointCategory.SourceV8,
            AuxPointCategory.Usb1,
            AuxPointCategory.Usb3,
        ],

        controls: {horz: false},

        // TODO: сделать универсальный формат
        // Y-координата верхней линии, где рисовать прямые токи
        curr_straight_top_y: 0,
        curr_straight_bottom_y: -1,
    }
}