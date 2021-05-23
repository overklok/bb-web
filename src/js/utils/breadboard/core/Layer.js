export default class Layer {
    constructor(container, grid, schematic=false, detailed=false, verbose=false) {
        if (!container) {
            throw new TypeError("Container is not defined");
        }

        if (!grid) {
            throw new TypeError("Grid is not defined");
        }

        this._container = container;

        this.__grid = grid;

        this.__schematic = schematic;
        this.__detailed = detailed;
        this.__verbose = verbose;

        this._onctxmenucall = undefined;
    }

    /**
     * Скомпоновать слой
     *
     * @abstract
     */
    compose() {throw new TypeError("This method should be overridden by inheriting classes")}

    recompose(schematic, detailed=false, verbose=false) {
        this.__schematic = schematic;
        this.__detailed = detailed;
        this.__verbose = verbose;
    }

    hide() {this._container.hide()}
    show() {this._container.show()}

    toggle(on=true) {
        if (on) {
            this.show();
        } else {
            this.hide();
        }
    }

    onContextMenuCall(cb) {
        this._onctxmenucall = cb;
    }

    /**
     *
     * @param menu
     * @param position
     * @param inputs
     *
     * @protected
     */
    _callContextMenu(menu, position, inputs) {
        this._onctxmenucall && this._onctxmenucall(menu, position, inputs);
    }

    _clearContextMenus() {
        this._onctxmenucall && this._onctxmenucall();
    }
}