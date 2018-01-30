import Wrapper from '../core/Wrapper'

import Blockly from 'node-blockly/browser'

const DIV_IDS = {
    BLOCKLY: "blockly-div",
    TOOLBOX: "blockly-toolbox"
};

/**
 * Обёртка библиотеки Blockly для отображения среды программирования
 */
class BlocklyWrapper extends Wrapper {
    constructor() {
        super();

        this.area          = undefined;     // узел вставки контейнера
        this.container     = undefined;     // контейнер Blockly
        this.toolbox       = undefined;     // узел с описанием типов блоков
        this.workspace     = undefined;     // SVG-контейнер с графикой Blockly
    }

    /**
     * Встроить Blockly в DOM-дерево
     *
     * @param {Object} dom_node DOM-узел, в который нужно вставить Blockly
     */
    inject(dom_node) {
        /// Определить узел вставки контейнера
        this.area        = dom_node;
        /// Сгенерировать контейнеры для Blockly и для типов блоков
        this.container   = document.createElement('div');
        this.toolbox     = document.createElement('div');
        /// Задать контейнерам соответствующие идентификаторы
        this.container.setAttribute("id", DIV_IDS.BLOCKLY);
        this.toolbox.setAttribute("id", DIV_IDS.TOOLBOX);

        /// Разместить контейнеры в DOM-дереве
        dom_node.appendChild(this.container);
        dom_node.appendChild(this.toolbox);

        /// Встроить Blockly в заданную систему контейнеров
        this.workspace = Blockly.inject(this.container, {toolbox: this.toolbox});

        // window.addEventListener('resize', this._onResize, false);

        /// Адаптировать размер Blockly под начальный размер контейнера
        this._onResize();
        Blockly.svgResize(this.workspace);
    }

    /**
     * Удалить Blockly из DOM-дерева
     *
     * Сам экземпляр Blockly, его содержимое и параметры отображения сохраняются
     */
    takeout() {
        /// Отключить отображение Blockly
        this.workspace.dispose();
        /// Удалить контейнеры
        this.container.remove();
        this.toolbox.remove();

        // window.removeEventListener('resize', this._onResize, false);
    }

    /**
     * Изменить размер среды Blockly
     *
     * https://developers.google.com/blockly/guides/configure/web/resizable
     */
    _onResize() {
        this.container.style.width   = (this.area.offsetWidth - 20) + 'px';
        this.container.style.height  = (this.area.offsetHeight - 20) + 'px';
        Blockly.svgResize(this.workspace);
    }
}

export default BlocklyWrapper;