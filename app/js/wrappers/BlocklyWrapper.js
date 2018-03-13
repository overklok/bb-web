import Wrapper from '../core/Wrapper'

import Blockly  from 'node-blockly/browser'
import Ru       from 'node-blockly/lib/i18n/ru';

import thm      from '../../css/blockly-overlay.css';

Blockly.setLocale(Ru);

const ERROR_COLOUR = "#920000";

const DIV_IDS = {
    BLOCKLY: "blockly-div",
    TOOLBOX: "blockly-toolbox",
    OVERLAY: "blockly-overlay"
};

const DIV_CLASSES = {
    OVERLAY_HIDDEN: "blockly-overlay-hidden",
};

const FIELD_TYPES = {
    NUMBER: "number",
    STRING: "string",
    COLOUR: "colour"
};

window.BLOCKLY_BTS_REG = false;

/**
 * Обёртка библиотеки Blockly для отображения среды программирования
 */
class BlocklyWrapper extends Wrapper {
    static get BLOCKLY_BLOCK_TYPES_REGISTERED() {return BLOCKLY_BTS_REG}

    constructor() {
        super();

        this.area               = undefined;     // узел вставки контейнера
        this.container          = undefined;     // контейнер Blockly
        this.toolbox            = undefined;     // узел с описанием типов блоков
        this.overlay            = undefined;

        this.workspace          = undefined;     // SVG-контейнер с графикой Blockly
        this._block_types       = undefined;     // JSON-типы блоков
        this._generators        = undefined;     // JS-генератор кода
        this._audibles          = undefined;     // Прослушиваемые типы блоков

        this.silent             = false;          // "тихий" режим, не обрабатывать события
        this.extra_fields       = false;          // режим доп. полей, для админки

        this._error_blocks = {};

        this._variable_blocks   = [];

        this._state = {
            lastCodeMain: undefined,            // последнее состояние главного кода
            changeListenerRegistered: false,    // зарегистрирован ли обработчик событий изменения
        };

        this._callbacks = {
            onChange: (statement) => {
                this._debug.warn("onChangeMain default callback was called", statement)
            },
            onChangeAudible: (block_code, statement) => {
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

        BLOCKLY_BTS_REG = true;
    }

    registerGenerators(generatorsJS) {
        this._generators = generatorsJS;

        this._loadGenerators();
    }

    /**
     * Встроить Blockly в DOM-дерево
     *
     * @param {Object}  dom_node        DOM-узел, в который нужно вставить Blockly
     * @param {boolean} use_scrollbars  использовать ли скролл-бары
     * @param {number}  zoom_initial    исходный зум-фактор
     * @param {boolean} read_only       режим только чтения
     */
    inject(dom_node, use_scrollbars=false, read_only=false, zoom_initial=0.7) {
        /// Определить узел вставки контейнера
        this.area        = dom_node;
        /// Сгенерировать контейнеры для Blockly и для типов блоков
        this.container   = document.createElement('div');
        this.toolbox     = document.createElement('xml');
        this.overlay     = document.createElement('div');
        /// Задать контейнерам соответствующие идентификаторы
        this.container.setAttribute("id", DIV_IDS.BLOCKLY);
        this.toolbox.setAttribute("id", DIV_IDS.TOOLBOX);

        if (!read_only) {
            this.overlay.setAttribute("id", DIV_IDS.OVERLAY);
            this.overlay.setAttribute("style", this._getOverlayStyle());
            this.unlock();
        }

        this.toolbox.style.display = 'none';

        /// Разместить контейнеры в DOM-дереве
        dom_node.appendChild(this.overlay);
        dom_node.appendChild(this.container);
        dom_node.appendChild(this.toolbox);

        /// Встроить Blockly в заданную систему контейнеров
        this.workspace = Blockly.inject(
            this.container,
            {
                toolbox: this.toolbox,
                readOnly: read_only,
                zoom: {
                    startScale: zoom_initial
                },
                scrollbars: use_scrollbars
            }
        );

        /// Заполнить буфер текущего кода, если ранее не был заполнен
        if (typeof this._state.code_buffer !== "undefined") {
            Blockly.Xml.domToWorkspace(this._state.code_buffer, this.workspace);
        }

        /// если не включён режим только чтения и обработчик событий изменения не был зарегистрирован ранее
        if (!read_only && !this._state.changeListenerRegistered) {
            this.workspace.addChangeListener(event => {
                if (!this.silent) {
                    this._filterEvent(event)
                }
            });
        }
        // window.addEventListener('resize', this._onResize, false);

        /// Адаптировать размер Blockly под начальный размер контейнера
        this._onResize();
        Blockly.svgResize(this.workspace);

        this._variable_blocks = [];
    }

    /**
     * Удалить Blockly из DOM-дерева
     *
     * Сам экземпляр Blockly, его содержимое и параметры отображения сохраняются
     */
    eject() {
        this._state.code_buffer = Blockly.Xml.workspaceToDom(this.workspace);

        /// Отключить отображение Blockly
        this.workspace.dispose();
        /// Удалить контейнеры
        this.overlay.remove();
        this.container.remove();
        this.toolbox.remove();

        // window.removeEventListener('resize', this._onResize, false);
    }

    lock() {
        if (!this.overlay) {return false}

        this.overlay.className = this.overlay.className.replace(new RegExp(`(?:^|\\s)${DIV_CLASSES.OVERLAY_HIDDEN}(?!\\S)`) ,'');
    }

    unlock() {
        if (!this.overlay) {return false}

        let classes = this.overlay.className.split(" ");
        if (classes.indexOf(DIV_CLASSES.OVERLAY_HIDDEN) === -1) {
            this.overlay.className += " " + DIV_CLASSES.OVERLAY_HIDDEN;
        }
    }

    clear() {
        if (!this.workspace) {return false}

        this.workspace.clear();
    }

    updateBlockLimit(block_limit) {
        if (!this.workspace) {return false}

        this.workspace.options.maxBlocks = block_limit;
        this.workspace.flyout_.filterForCapacity_();

        return true;
    }

    /**
     * Использовать типы блоков
     *
     * Обновляется содержимое тулбокса
     *
     * @param block_types {object} объект типов блоков типа: {тип_блока: макс. кол-во}
     */
    updateBlockTypes(block_types) {
        let toolbox_content = "";

        let block_type_array = Array.isArray(block_types) ? block_types : Object.keys(block_types);

        for (let block_type of block_type_array) {
            toolbox_content += "<block type='" + block_type + "'></block>";
        }

        this.toolbox.innerHTML = toolbox_content;

        this.workspace.updateToolbox(this.toolbox);
    }

    highlightBlock(block_id) {
        this.workspace.highlightBlock(block_id);
    }

    highlightErrorBlock(block_id) {
        let block = this.workspace.getBlockById(block_id);
        let colour = block.getColour(ERROR_COLOUR);

        block.setColour(ERROR_COLOUR);

        this._error_blocks[block_id] = {colour: colour, block: block};
    }

    clearErrorBlocks() {
        for (let block_id of Object.keys(this._error_blocks)) {
            let block = this._error_blocks[block_id].block;
            let colour = this._error_blocks[block_id].colour;

            block.setColour(colour);
            
            delete this._error_blocks[block_id];
        }
    }

    setMaxBlockLimit() {
        if (!this.workspace) {return false}
    }

    getBlockTypes() {
        if (!this.workspace) {return false}

        let block_types = [];

        for (let block of this.workspace.getAllBlocks()) {
            if (!block.isShadow()) {
                block_types.push(block.type);
            }
        }

        return block_types;
    }

    /**
     * Определить достаточное (но не всегда необходимое) число блоков
     * для сборки текущей последовательности блоков
     *
     * @returns {int} число блоков
     */
    getBlockLimit() {
        if (!this.workspace) {return false}

        let block_count = 0;

        let blocks = this.workspace.getAllBlocks();

        let block_taken_ids = new Set();

        for (let block of blocks) {
            if (!block_taken_ids.has(block.id)) {
                block_count += 1;
            }

            block_taken_ids.add(block.id);

            for (let subblock of block.childBlocks_) {
                /// Блок не должен быть вложенной цепочкой
                if (subblock.nextConnection || subblock.previousConnection) {
                    continue;
                }

                if (block_taken_ids.has(subblock.id)) {
                    if (!subblock.isShadow_) {
                        block_count += 1;
                    }
                } else  {
                    if (!subblock.isShadow_) {
                        block_count += 2;
                    } else {
                        block_count += 1;
                    }
                }

                block_taken_ids.add(subblock.id);
            }
        }

        return block_count;
    }

    /**
     * TODO Refactor -> getBlockLimitInputsByType
     * @returns {*}
     */
    getBlockLimitInputsByType() {
        if (!this.workspace) {return false}

        let block_counts = {};

        for (let block of this.workspace.getAllBlocks()) {
            for (let input of block.inputList) {
                for (let field of input.fieldRow) {
                    if (field.name === "MAX_COUNT") {
                        block_counts[block.type] = parseInt(field.text_);
                    }
                }
            }
        }

        return block_counts;
    }

    setBlockLimitInputsByType(block_counts) {
        if (!this.workspace) {return false}

        if (!block_counts) {return false}

        for (let block of this.workspace.getAllBlocks()) {
            for (let input of block.inputList) {
                for (let field of input.fieldRow) {
                    if (field.name === "MAX_COUNT") {
                        console.log(field);
                        let value = block_counts[block.type] || 0;

                        field.setValue(value);
                    }
                }
            }
        }

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

    /**
     * Получить список обработчиков в виде объекта
     *
     * @returns {{main, sub}}, где main - главный обработчик, sub - обработчик нажатий клавиши
     *                         main и sub имеют следующий формат:
     *                         TODO: определить формат для обработчика
     */
    getJSONHandlers() {
        let code = Blockly.JSON.workspaceToCode(this.workspace);
        let statements = Blockly.JSON.audible_args;

        this._lastCodeMain = code;

        return {main: code, sub: statements};
    }

    /**
     * Получить строку с XML-кодом состояния рабочей области Blockly
     *
     * @returns {string} строка, содержащая XML-представление набранного кода
     */
    getXMLText() {
        let dom = Blockly.Xml.workspaceToDom(this.workspace);
        return Blockly.Xml.domToText(dom);
    }

    /**
     * Задать состояние рабочей области Blockly через строку с XML-кодом
     *
     * @param text строка, содержащая XML-представление кода Blockly
     */
    setXMLText(text) {
        let dom = Blockly.Xml.textToDom(text);
        Blockly.Xml.domToWorkspace(dom, this.workspace);
    }

    /**
     * Задать массив блоков-обработчиков
     *
     * Впоследствии в этих блоках будут обнаржуиваться глубокие изменения
     *
     * @param {Array} audibles массив названий типов блоков-обработчиков
     */
    setAudibles(audibles) {
        this._audibles = audibles;
    }

    /**
     * Задать обработчик события изменения основного кода
     *
     * @deprecated
     *
     * @param {function} callback функция, вызывающаяся при изменении основного кода
     */
    onChange(callback) {
        this._callbacks.onChange = callback;
    }

    /**
     * Назначить обработчик события глубоких изменений в коде
     *
     * К глубоким изменениям относятся:
     *  - изменение параметров блоков, заданных в _audibles
     *  - изменение параметров блоков, вложенных в блоки, заданные в _audibles
     *
     *  О пределе уровня вложенности см. [[_filterEvent()]]
     *
     * @param callback  функция обратного вызова, в которую при глубоких изменениях будут передаваться
     *                  следующие параметры:
 *                          - {string} код изменённого блока-родителя
     *                      - {string} вложенный код блока-родителя (если изменён)
     */
    onChangeAudible(callback) {
        this._callbacks.onChangeAudible = callback;
    }

    /**
     * Загрузить типы блоков в JSON
     *
     * @private
     */
    _loadBlocksJSON() {
        for (let block_name of Object.keys(this._block_types)) {
            Blockly.Blocks[block_name] = this._block_types[block_name];
        }
    }

    /**
     * Загрузить генераторы для типов блоков
     *
     * @private
     */
    _loadGenerators() {
        for (let generator_name of Object.keys(this._generators)) {
            Blockly.JSON[generator_name] = this._generators[generator_name];
        }
    }

    addVariableBlock(block_type, field_type=FIELD_TYPES.STRING, value=0) {
        let block = this.workspace.newBlock(block_type);

        block.initSvg();
        block.render();

        let variable_name = "";
        let pos_y = this._getAllVariablesHeight();

        try {
            variable_name = block.inputList[0].fieldRow[0].text_;
        } catch (e) {
            console.error("Variable block of type `" + block_type + "` has not a dummy input at 0 index");
        }

        this._addFieldToVariableBlock(block, field_type);

        block.setFieldValue(variable_name + " = ");
        block.setFieldValue(value, "DUMMY");
        block.moveBy(0, pos_y);

        this._variable_blocks[block_type] = {name: variable_name, element: block, pos_y: pos_y};
    }

    clearVariableBlocks() {
        for (let block_type in this._variable_blocks) {
            this._variable_blocks[block_type].element.dispose();
        }

        this._variable_blocks = [];
    }

    setVariableBlockValue(type, value=0) {
        let block = this._variable_blocks[type];

        if (!block) {throw new RangeError("Variable of type `" + type + "`does not exist in the base")}

        block.element.setFieldValue(value, "DUMMY");
    }

    addBlock(type) {
        let block = this.workspace.newBlock(type);
        block.initSvg();
        block.render();

        // var parentBlock = workspace.newBlock('text_print');
        // parentBlock.initSvg();
        // parentBlock.render();
        //
        // var childBlock = workspace.newBlock('text');
        //
        // childBlock.setFieldValue('Hello', 'TEXT');
        // childBlock.initSvg();
        // childBlock.render();
        //
        // var parentConnection = parentBlock.getInput('TEXT').connection;
        // var childConnection = childBlock.outputConnection;
        // parentConnection.connect(childConnection);
    }

    _addFieldToVariableBlock(block, field_type) {
        let field = undefined;

        switch (field_type) {
            case FIELD_TYPES.NUMBER: {
                field = new Blockly.FieldNumber(); /// no constraints
                break;
            }
            case FIELD_TYPES.STRING: {
                field = new Blockly.FieldTextInput(); /// no constraints
                break;
            }
            case FIELD_TYPES.COLOUR: {
                field = new Blockly.FieldColour();
                break;
            }
            default: {
                field = new Blockly.FieldLabel();
                break;
            }
        }

        block.setInputsInline(true);
        block.appendDummyInput()
            .appendField(field, "DUMMY");
    }

    _getAllVariablesHeight() {
        let height_sum = 0;

        for (let block_type in this._variable_blocks) {
            height_sum += this._variable_blocks[block_type].element.height;
        }

        return height_sum;
    }

    /**
     * Определить стиль оверлея
     *
     * @private
     */
    _getOverlayStyle() {
        return "position: absolute; width: 98%; height: 98%; z-index: 21;";
    }

    /**
     * Изменить размер среды Blockly
     *
     * https://developers.google.com/blockly/guides/configure/web/resizable
     */
    _onResize() {
        this.container.style.width   = (this.area.offsetWidth - 24) + 'px';
        this.container.style.height  = (this.area.offsetHeight - 24) + 'px';
        Blockly.svgResize(this.workspace);
    }

    /**
     * Первичная обработка стандартных событий Blockly
     *
     * Обнаруживаются глубокие изменения для блоков-обработчиков, задаваемых
     * с помощью функции [[setAudibles()]]
     *
     * @param event событие Blockly
     * @private
     */
    _filterEvent(event) {
        if (this.extra_fields) {
            if (event.type === Blockly.Events.CREATE) {
                let block = this.workspace.getBlockById(event.blockId);

                block.appendDummyInput()
                    .appendField(new Blockly.FieldLabel("[МАКС. КОЛ-ВО]"), "LABEL")
                    .appendField(new Blockly.FieldNumber(), "MAX_COUNT");

                this._callbacks.onChange();
            }
        }

        if (event.type === Blockly.Events.CHANGE || event.type === Blockly.Events.MOVE) {
            this._callbacks.onChange();
        }
        // if (event.type === Blockly.Events.CHANGE || event.type === Blockly.Events.MOVE) {
        //     let is_deep_change = false;
        //
        //     let block = undefined;
        //     let is_orphan = false;
        //
        //     if (event.oldParentId) {
        //         block = this.workspace.getBlockById(event.oldParentId);
        //         is_orphan = true;
        //     } else {
        //         block = this.workspace.getBlockById(event.blockId);
        //     }
        //
        //     if (block) {
        //         /// Корневой блок (не имеющий родителей)
        //         let root = block.getRootBlock();
        //
        //         /// Если этот блок нужно глубоко прослушивать (напр., это обработчик)
        //         if (this._audibles.indexOf(root.type) >= 0) {
        //             /// Если изменение не является результатом перемещения родительского блока
        //             if (!(event.type === Blockly.Events.MOVE && block === root && !is_orphan)) {
        //                 /// отметить, что изменение - глубокое
        //                 is_deep_change = true;
        //
        //                 /// если нет объекта с данными обработчиков, создать пустой
        //                 if (typeof Blockly.JSON.audible_args === "undefined") {
        //                     Blockly.JSON.audible_args = {};
        //                 }
        //
        //                 /// зафиксировать обработчик "до"
        //                 let audible_args_before = Blockly.JSON.audible_args[root.id];
        //                 /// обновить информацию об обработчике
        //                 Blockly.JSON.blockToCode(root);
        //                 /// зафиксировать обработчик "после"
        //                 let audible_args_after = Blockly.JSON.audible_args[root.id];
        //
        //                 /// по умолчанию
        //                 let audible_args = {
        //                     btn: audible_args_after.btn
        //                 };
        //
        //                 /// если код обработчика изменился
        //                 if (!audible_args_before || (audible_args_before.code !== audible_args_after.code)) {
        //                     audible_args["code"] = audible_args_after.code;
        //                 }
        //
        //                 this._callbacks.onChangeAudible(root.id, audible_args);
        //
        //             } // <если изменение не является результатом перемещения родительского блока>
        //         } // <если блок в списке _audibles>
        //     } // <если событие для блока>
        //
        //     /// Если изменение - не глубокое, учесть этот случай
        //     if (!is_deep_change) {
        //         let code_after = Blockly.JSON.workspaceToCode(this.workspace);
        //
        //         if (this._lastCodeMain !== code_after) {
        //             this._callbacks.onChange(code_after);
        //
        //             this._lastCodeMain = code_after;
        //         }
        //     }
        // }
    }
}

export default BlocklyWrapper;