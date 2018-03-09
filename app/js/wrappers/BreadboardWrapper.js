import Wrapper from "../core/Wrapper";

import Breadboard from "../~utils/breadboard/Breadboard";
import ResistorPlate from "../~utils/breadboard/plates/ResistorPlate";
import Point from "../~utils/breadboard/core/Cell";

const PLATE_TYPES = {
    'resistor': 'resistor',
    'res': 'resistor',
    'bridge': 'bridge',
    'capacitor': 'capacitor',
    'strip': 'strip'
};

/**
 * Обёртка библиотеки Breadboard для отображения макетной платы
 */
class BreadboardWrapper extends Wrapper {
    constructor() {
        super();

        this._bb = new Breadboard();
    }

    /**
     * Встроить Breadboard в DOM-дерево
     *
     * @param {object}  dom_node    DOM-узел, в который нужно вставить Breadboard
     * @param {boolean} read_only   Режим только чтения
     */
    inject(dom_node, read_only) {
        this._bb.inject(dom_node, {
            readOnly: read_only,
        });
    }

    /**
     * Удалить Breadboard из DOM-дерева
     *
     * Сам экземпляр Breadboard, его содержимое и параметры отображения сохраняются
     */
    eject() {
        this._bb.dispose();
    }

    setPlates(plates) {
        this._bb.clearPlates();

        for (let plate of plates) {
            this._bb.addPlate(PLATE_TYPES[plate.type], plate.x, plate.y, plate.orientation, plate.id, plate.number);
        }
    }

    setPlateState(plate_id, state) {
        this._bb.setPlateState(plate_id, state);
    }

    setCurrent(points) {
        this._bb._layers.current.removeAllCurrents();

        this._bb._layers.current.addCurrentGood(points);
    }
}

export default BreadboardWrapper;