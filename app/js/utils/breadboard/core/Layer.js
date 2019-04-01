export default class Layer {
    constructor(container, grid, schematic=false) {
        if (!container) {
            throw new TypeError("Container is not defined");
        }

        if (!grid) {
            throw new TypeError("Grid is not defined");
        }

        this._container = container;

        this.__grid = grid;

        this.__schematic = schematic;
    }

    /**
     * Скомпоновать слой
     *
     * @abstract
     */
    compose() {throw new TypeError("This method should be overridden by inheriting classes")}

    hide() {this._container.hide()}
    show() {this._container.show()}

    toggle(on=true) {
        if (on) {
            this.show();
        } else {
            this.hide();
        }
    }
}