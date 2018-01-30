import Wrapper from "../core/Wrapper";

import Breadboard from "../~utils/breadboard/core/Breadboard";

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
        this._bb.start(dom_node);

        this._bb.brush.node.style.width = '100%';
        this._bb.brush.node.style.height = '100%';
    }

    /**
     * Удалить Breadboard из DOM-дерева
     *
     * Сам экземпляр Breadboard, его содержимое и параметры отображения сохраняются
     */
    takeout() {
        this._bb.clear();
    }

}

export default BreadboardWrapper;