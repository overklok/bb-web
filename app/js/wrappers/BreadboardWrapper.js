import Wrapper from "../core/Wrapper";
import Breadboard from "../utils/breadboard/Breadboard";

/**
 * Обёртка библиотеки Breadboard для отображения макетной платы
 */
export default class BreadboardWrapper extends Wrapper {
    constructor() {
        super();

        this._plugin = new Breadboard();

        this._onchange = function(data) {console.warn("BreadboardWrapper's `onchange` event emitted with data: ", data)};
    }

    /**
     * Встроить Breadboard в DOM-дерево
     *
     * @param {object}  dom_node    DOM-узел, в который нужно вставить Breadboard
     * @param {boolean} read_only   Режим только чтения
     */
    inject(dom_node, read_only=true) {
        if (!dom_node) {
            throw new TypeError("DOM Node must be defined");
        }

        this._plugin.inject(dom_node, {
            readOnly: read_only
        });
    }

    /**
     * Удалить Breadboard из DOM-дерева
     *
     * Сам экземпляр Breadboard, его содержимое и параметры отображения сохраняются
     */
    eject() {
        this._plugin.dispose();
    }

    setReadOnly(readOnly) {
        this._plugin.setReadOnly(readOnly);
    }

    getPlates() {
        return this._plugin.getPlates();
    }

    setPlates(plates) {
        if (!plates) throw new TypeError ("Plates is not iterable");

        // this._plugin.clearPlates();

        this._plugin.clearRegions();

        return this._plugin.setPlates(plates);
    }

    highlightErrorPlates(plate_ids) {
        if (!plate_ids) {return true}

        this._plugin.highlightPlates(plate_ids, true);
    }

    setPlateState(plate_id, state) {
        this._plugin.setPlateState(plate_id, state);
    }

    setCurrents(threads) {
        this._plugin.setCurrents(threads);
    }

    removeCurrents() {
        this._plugin._layers.current.removeAllCurrents();
    }

    highlightRegion(region, clear) {
        if (!region) {
            return false;
        }

        this._plugin.highlightRegion(region.from, region.to, clear);
    }

    clearRegions() {
        this._plugin.clearRegions();
    }

    switchSpareFilters(on) {
        this._plugin.switchSpareFilters(on);
    }

    switchSchematic(on, detailed=false) {
        this._plugin.switchSchematic(on, detailed);
    }

    onChange(cb) {
        this._plugin.onChange(cb);
    }

    onDragStart(cb) {
        this._plugin.onDragStart(cb);
    }
}
