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
        this._block_types  = undefined;     // XML- и JSON-типы блоков
    }

    registerBlockTypes(blocksJSON, blocksXML) {
        this._block_types = {
            JSON:   blocksJSON,
            XML:    blocksXML
        };

        this._loadBlocksJSON();
    }

    /**
     * Встроить Blockly в DOM-дерево
     *
     * @param {Object} dom_node DOM-узел, в который нужно вставить Blockly
     */
    include(dom_node) {
        /// Определить узел вставки контейнера
        this.area        = dom_node;
        /// Сгенерировать контейнеры для Blockly и для типов блоков
        this.container   = document.createElement('div');
        this.toolbox     = document.createElement('xml');
        /// Задать контейнерам соответствующие идентификаторы
        this.container.setAttribute("id", DIV_IDS.BLOCKLY);
        this.toolbox.setAttribute("id", DIV_IDS.TOOLBOX);

        this.toolbox.style.display = 'none';

        /// Разместить контейнеры в DOM-дереве
        dom_node.appendChild(this.container);
        dom_node.appendChild(this.toolbox);

        /// Встроить Blockly в заданную систему контейнеров
        this.workspace = Blockly.inject(
            this.container,
            {
                toolbox: this.toolbox,
                zoom: {
                    startScale: 0.7
                }
            }
        );

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
    exclude() {
        /// Отключить отображение Blockly
        this.workspace.dispose();
        /// Удалить контейнеры
        this.container.remove();
        this.toolbox.remove();

        // window.removeEventListener('resize', this._onResize, false);
    }

    useBlockTypes() {
        this.toolbox.innerHTML = "<block type='set_leds_mix'></block>";

        this._loadBlocksXML();

        this.workspace.updateToolbox(this.toolbox);
    }

    /**
     * Получить текущий код программы Blockly в нотации XML
     *
     * https://developers.google.com/blockly/guides/get-started/web
     *
     * @returns {string} строка, содержащая XML-код программы
     */
    getXMLCode() {
        let xml = Blockly.Xml.workspaceToDom(this.workspace);

        return Blockly.Xml.domToText(xml);
    }

    _loadBlocksJSON() {
        for (let block_name of Object.keys(this._block_types.JSON)) {
            Blockly.Blocks[block_name] = this._block_types.JSON[block_name];
        }
    }

    _loadBlocksXML() {
        for (let block_name of Object.keys(this._block_types.XML)) {
            $('block[type="' + block_name + '"]').html(this._block_types.XML[block_name]);
        }
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