import LinearPlate from "../core/plate/LinearPlate";

export default class MotorPlate extends LinearPlate {
    static get Alias() {return "bridge"}

    constructor(container, grid, schematic=false, verbose=false, id) {
        super(container, grid, schematic, verbose, id);

        this._params.size = {x: 2, y: 1};
    }
}