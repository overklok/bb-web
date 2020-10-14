import BackgroundLayer from "../../layers/BackgroundLayer";
import LabelLayer from "../../layers/LabelLayer";
import Grid from "../Grid";

export const LAYOUTS = {
    v5x: {
        plate_style: {
            label_font_size: 16,
        },

        label_style: {
            font_size: 28,
            text_bias: 14,
        },

        wrap_width: 1200, // Ширина рабочей области
        wrap_height: 1350, // Высота рабочей области

        grid_width: 1000,
        grid_height: 1100,

        grid_gap_x: 20,
        grid_gap_y: 20,

        grid_rows: 11,   // Количество рядов в сетке точек
        grid_cols: 10,   // Количество колонок в сетке точек

        grid_pos_x: 120,
        grid_pos_y: 200,

        domains: [
            // Линия аналоговых пинов
            {
                horz: true,
                from: {x: 0, y: 0}, to: {x: -1, y: 0},
                minus_from: {x: 0, y: -1}, minus_to: {x: -1, y: -1},
                style: BackgroundLayer.DomainSchematicStyles.None,
                role: LabelLayer.CellRoles.Analog
            },

            // Верхняя линия "+"
            {
                horz: true, from: {x: 0, y: 1}, to: {x: -1, y: 1}, inv: true,
                role: LabelLayer.CellRoles.Plus,
                no_labels: true
            },

            // Нижняя линия "-"
            {
                horz: true, from: {x: 0, y: -1}, to: {x: -1, y: -1},
                role: LabelLayer.CellRoles.Minus,
                no_labels: true
            },

            // Две группы вертикальных линий
            {horz: false, from: {x: 0, y: 2}, to: {x: -1, y: 5}},
            {horz: false, from: {x: 0, y: 6}, to: {x: -1, y: 9}},
        ],

        points: [
            Grid.AuxPointCats.SourceV5,
        ],

        controls: {horz: true}
    }
};