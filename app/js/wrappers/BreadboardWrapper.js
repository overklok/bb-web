import Wrapper from "../core/Wrapper";

import Breadboard from "../~utils/breadboard/Breadboard";
import ResistorPlate from "../~utils/breadboard/plates/ResistorPlate";
import Point from "../~utils/breadboard/core/Cell";

const PLATE_TYPES = {
    'resistor': 'resistor',
    'res': 'resistor'
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
     * @param {Object} dom_node DOM-узел, в который нужно вставить Breadboard
     */
    inject(dom_node) {
        this._bb.inject(dom_node);

        // setInterval(() => {
        //     this._bb.dispose();
        //     setTimeout(() => {
        //         this._bb.inject(dom_node);
        //     }, 500);
        // }, 5000)

        // this._bb.grid.addPlate(ResistorPlate, new Cell(0, 0, this._bb.grid), 'north');
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

    setCurrent(points) {
        this._bb._layers.current.removeAllCurrents();

        this._bb._layers.current.addCurrentGood(points);
    }
}

export default BreadboardWrapper;