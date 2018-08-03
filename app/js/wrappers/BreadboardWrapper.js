import Wrapper from "../core/Wrapper";

import domtoimage from 'dom-to-image';

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
            readOnly: read_only,
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

    getPlates() {
        return this._plugin.getPlates();
    }


    setPlates(plates) {
        if (!plates) throw new TypeError ("Plates is not iterable");

        // this._plugin.clearPlates();

        this._plugin.setPlates(plates);
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

    onChange(cb) {
        this._plugin.onChange(cb);
    }

    onDragStart(cb) {
        this._plugin.onDragStart(cb);
    }

    _saveToImage() {
        let svg = this._plugin.getContainer();

        console.log(svg);

        if (!svg) {
            return;
        }

        domtoimage.toJpeg(svg)
            .then(function (dataUrl) {
                let img = new Image();
                img.src = dataUrl;
                document.body.appendChild(img);
            })
            .catch(function (error) {
                console.error('oops, something went wrong!', error);
            });
    }
}