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
        this._generators   = undefined;     // JS-генератор кода

        this._state = {
            code_buffer: undefined
        };

        Blockly.HSV_SATURATION = 1;
        Blockly.HSV_HUE = 1;
    }

    registerBlockTypes(blocksJSON) {
        this._block_types = blocksJSON;

        this._loadBlocksJSON();
    }

    registerGenerators(generatorsJS) {
        this._generators = generatorsJS;

        this._loadGenerators();
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

        if (typeof this._state.code_buffer !== "undefined") {
            Blockly.Xml.domToWorkspace(this.workspace, this._state.code_buffer);
        }

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
        this._state.code_buffer = Blockly.Xml.workspaceToDom(this.workspace);

        /// Отключить отображение Blockly
        this.workspace.dispose();
        /// Удалить контейнеры
        this.container.remove();
        this.toolbox.remove();

        // window.removeEventListener('resize', this._onResize, false);
    }

    /**
     * Использовать типы блоков
     *
     * Обновляется содержимое тулбокса
     *
     * @param block_types {Array} массив типов блоков
     */
    useBlockTypes(block_types) {
        let toolbox_content = "";

        for (let block_type of block_types) {
            toolbox_content += "<block type='" + block_type + "'></block>";
        }

        this.toolbox.innerHTML = toolbox_content;

        this.workspace.updateToolbox(this.toolbox);
    }

    highlightBlock(block_id) {
        this.workspace.highlightBlock(block_id);
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

    getJSONCode() {
        return Blockly.JavaScript.workspaceToCode(this.workspace);
    }

    _loadBlocksJSON() {
        for (let block_name of Object.keys(this._block_types)) {
            Blockly.Blocks[block_name] = this._block_types[block_name];
        }
    }

    _loadGenerators() {
        for (let generator_name of Object.keys(this._generators)) {
            Blockly.JavaScript[generator_name] = this._generators[generator_name];
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