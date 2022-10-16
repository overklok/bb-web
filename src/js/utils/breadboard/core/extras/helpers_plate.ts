import SVG from "svg.js";

import Grid from "../Grid";
import PlateLayer from "../../layers/PlateLayer";
import { Layout } from "../types";
import { SerializedPlate } from "../Plate";

export function comparePlates(layout: Layout, plate1: SerializedPlate, plate2: SerializedPlate) {
    const grid = new Grid(layout);
    const svg = SVG(document.createElement("div"));

    return PlateLayer.comparePlates(svg, grid, plate1, plate2);
}
