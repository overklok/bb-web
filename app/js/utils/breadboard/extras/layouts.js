import BackgroundLayer from "../layers/BackgroundLayer";
import LabelLayer from "../layers/LabelLayer";
import Grid from "../core/Grid";

export const LAYOUTS = {
    v8x: {
        wrap_width:     850,  // Ширина рабочей области
        wrap_height:    1300, // Высота рабочей области

        grid_width:     580,
        grid_height:    1180,

        grid_gap_x:     10,
        grid_gap_y:     10,

        grid_rows:      16,   // Количество рядов в сетке точек
        grid_cols:      8,   // Количество колонок в сетке точек

        grid_pos_x:     190,
        grid_pos_y:     70,

        domains: [
            // Верхняя линия
            {
                horz: true, from: {x: 0, y: 0}, to: {x: 3, y: 0},
                role: LabelLayer.CellRoles.Plus, inv: true,
                label_pos: "top",
            },
            {
                horz: true,
                from: {x: 4, y: 0}, to: {x: -1, y: 0},
                minus_from: {x: 0, y: 15}, minus_to: {x: 3, y: 15},
                role: LabelLayer.CellRoles.Analog,
                style: BackgroundLayer.DomainSchematicStyles.Dotted,
                pins_from: 0, inv: true,
                before: 1,
                label_pos: "top"
            },

            // Нижняя линия
            {
                horz: true,
                from: {x: 0, y: 15}, to: {x: 3, y: 15},
                role: LabelLayer.CellRoles.Minus,
                label_pos: "bottom",
            },
            {
                horz: true,
                from: {x: 4, y: 15}, to: {x: -1, y: 15},
                minus_from: {x: 0, y: 15}, minus_to: {x: 3, y: 15},
                role: LabelLayer.CellRoles.Analog,
                style: BackgroundLayer.DomainSchematicStyles.Dotted,
                pins_to: 11,
                before: 1,
                label_pos: "bottom"
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

            // Одиночные контакты - аналоговые пины
            {
                horz: false,
                from: {x: -1, y: 4}, to: {x: -1, y: 4},
                minus: {x: 3, y: 15},
                role: LabelLayer.CellRoles.Analog, pins_from: 4
            },
            {
                horz: false,
                from: {x: -1, y: 5}, to: {x: -1, y: 5},
                minus: {x: 3, y: 15},
                role: LabelLayer.CellRoles.Analog, pins_from: 5
            },
            {
                horz: false,
                from: {x: -1, y: 10}, to: {x: -1, y: 10},
                minus: {x: 3, y: 15},
                role: LabelLayer.CellRoles.Analog, pins_from: 6
            },
            {
                horz: false,
                from: {x: -1, y: 11}, to: {x: -1, y: 11},
                minus: {x: 3, y: 15},
                role: LabelLayer.CellRoles.Analog, pins_from: 7
            },
        ],

        points: [
            Grid.AuxPointCats.SourceV8,
            Grid.AuxPointCats.Usb1,
            Grid.AuxPointCats.Usb3,
        ],

        controls: {horz: false},
    }
}