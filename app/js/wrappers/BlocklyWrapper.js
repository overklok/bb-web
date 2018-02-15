import Wrapper from '../core/Wrapper'

import Blockly  from 'node-blockly/browser'
import Ru       from 'node-blockly/lib/i18n/ru';

Blockly.setLocale(Ru);

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

        this.area               = undefined;     // узел вставки контейнера
        this.container          = undefined;     // контейнер Blockly
        this.toolbox            = undefined;     // узел с описанием типов блоков
        this.workspace          = undefined;     // SVG-контейнер с графикой Blockly
        this._block_types       = undefined;     // JSON-типы блоков
        this._generators        = undefined;     // JS-генератор кода
        this._audibles          = undefined;     // Прослушиваемые типы блоков

        this.silent            = false;          // "тихий" режим, не обрабатывать события

        this._lastCodeMain      = undefined;     // последнее состояние главного кода

        this._callbacks = {
            onChange: (statement) => {
                this._debug.warn("onChangeMain default callback was called", statement)
            },
            onChangeDeep: (block_code, statement) => {
                this._debug.warn("onChangeAudible default callback was called", block_code, statement)
            }
        };

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
     * @param {Boolean} use_scrollbars использовать ли скролл-бары
     */
    include(dom_node, use_scrollbars=false) {
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
                },
                scrollbars: use_scrollbars
            }
        );

        if (typeof this._state.code_buffer !== "undefined") {
            Blockly.Xml.domToWorkspace(this._state.code_buffer, this.workspace);
        }

        this.workspace.addChangeListener(event => {
            if (!this.silent) {
                this._onAudibleDeepChanges(event)
            }
        });
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
        this.workspace.removeChangeListener(this._onAudibleChange);

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

    getJSONHandlers() {
        let code = Blockly.JSON.workspaceToCode(this.workspace);
        let statements = Blockly.JSON.statements;

        this._lastCodeMain = code;

        return {main: code, sub: statements};
    }

    _loadBlocksJSON() {
        for (let block_name of Object.keys(this._block_types)) {
            Blockly.Blocks[block_name] = this._block_types[block_name];
        }
    }

    _loadGenerators() {
        for (let generator_name of Object.keys(this._generators)) {
            Blockly.JSON[generator_name] = this._generators[generator_name];
        }
    }

    getXMLText() {
        let dom = Blockly.Xml.workspaceToDom(this.workspace);
        return Blockly.Xml.domToText(dom);
    }

    setXMLText(text) {
        console.log(this.workspace);

        let dom = Blockly.Xml.textToDom(text);
        Blockly.Xml.domToWorkspace(dom, this.workspace);
    }

    setAudibles(audibles) {
        this._audibles = audibles;
    }

    onChangeMain(callback) {
        this._callbacks.onChange = callback;
    }

    /**
     * Назначить обработчик события глубоких изменений в коде
     *
     * К глубоким изменениям относятся:
     *  - изменение параметров блоков, заданных в _audibles
     *  - изменение параметров блоков, вложенных в блоки, заданные в _audibles
     *
     *  О пределе уровня вложенности см. [[_onAudibleDeepChanges()]]
     *
     * @param callback  функция обратного вызова, в которую при глубоких изменениях будут передаваться
     *                  следующие параметры:
 *                          - {string} код изменённого блока-родителя
     *                      - {string} вложенный код блока-родителя (если изменён)
     */
    onChangeAudible(callback) {
        this._callbacks.onChangeDeep = callback;
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

    _onAudibleDeepChanges(event) {
        if (event.type === Blockly.Events.CHANGE || event.type === Blockly.Events.MOVE) {

            let is_deep_change = false;

            let block = this.workspace.getBlockById(event.blockId);

            if (block) {
                /// Корневой блок (не имеющих родителей)
                let root = block.getRootBlock();

                /// Если изменение не является результатом перемещения родительского блока
                if (!(event.type === Blockly.Events.MOVE && block === root)) {

                    if (typeof Blockly.JSON.statements === "undefined") {
                        Blockly.JSON.statements = {};
                    }

                    let nested_code_before = Blockly.JSON.statements[root.id];
                    let block_code = Blockly.JSON.blockToCode(root);
                    let nested_code_after = Blockly.JSON.statements[root.id];

                    let nested_code = (nested_code_before === nested_code_after) ? null : nested_code_after;

                    if (this._audibles.indexOf(root.type) >= 0) {
                        this._callbacks.onChangeDeep(block_code, nested_code);

                        is_deep_change = true;
                    }
                }
            }

            /// Если изменение - не глубокое, учесть этот случай
            if (!is_deep_change) {
                let code_after = Blockly.JSON.workspaceToCode(this.workspace);

                if (this._lastCodeMain !== code_after) {
                    this._callbacks.onChange(code_after);

                    this._lastCodeMain = code_after;
                }
            }
        }
    }
}

export default BlocklyWrapper;