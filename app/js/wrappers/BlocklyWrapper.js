/**
 * @external {Blockly.BlockSvg} https://developers.google.com/blockly/reference/js/Blockly.BlockSvg
 * @external {Blockly.WorkspaceSvg} https://developers.google.com/blockly/reference/js/Blockly.WorkspaceSvg
 */

import Wrapper from '../core/Wrapper'

import Blockly  from 'node-blockly/browser'
import Ru       from 'node-blockly/lib/i18n/ru';

import '../../css/blockly-overrides.css';
import '../../css/blockly-dimmer.css';

Blockly.setLocale(Ru);

Blockly.FieldDropdown.prototype.crtmenu = Blockly.FieldDropdown.prototype.createMenu_;

Blockly.FieldDropdown.prototype.createMenu_ = function() {
    let menu = this.crtmenu();

    let options = this.getOptions();

    for (let i in menu.element_.childNodes) {
        if (i in options && options[i].length > 2) {
            if (menu.element_.childNodes[i]) {
                if (menu.element_.childNodes[i].hasChildNodes()) {
                    menu.element_.childNodes[i].childNodes[0].style.color = options[i][2];
                    if (i in options && options[i].length > 3) {
                        menu.element_.childNodes[i].style.backgroundColor = options[i][3];
                    }
                }
            }
        }
    }

    return menu;
};

// Blockly.BlockSvg.prototype.rndr = Blockly.BlockSvg.prototype.render;
//
// Blockly.BlockSvg.prototype.render = function(a) {
//     let result = this.rndr(a);
//
    // console.log("renderee", this, this.onRender);
    //
    // if (this.onRender) {
    //     this.onRender();
    //     console.log("onRender called");
    //     this.onRender = undefined;
    // }
    //
    // return result;
// };

const VARIABLE_OFFSET_X = 5;
const VARIABLE_OFFSET_Y = 5;

const ERROR_COLOUR = "#920000";

const DIV_IDS = {
    BLOCKLY: "blockly-div",
    TOOLBOX: "blockly-toolbox",
    DIMMER: "blockly-dimmer"
};

const DIV_CLASSES = {
    DIMMER_HIDDEN: "blockly-dimmer-hidden",
};

const FIELD_TYPES = {
    NUMBER: "number",
    STRING: "string",
    COLOUR: "colour"
};

/**
 * Глобальная переменная, определяющая, загружены ли уже типы блоков в Blockly
 * Видимость переменной необходима в области 'window',
 * т.к. все экземпляры Blockly таже имеют к ней доступ
 */
window.BLOCKLY_BTS_REG = false;

/**
 * Обёртка библиотеки Blockly для отображения среды программирования
 */
export default class BlocklyWrapper extends Wrapper {
    static get BLOCKLY_BLOCK_TYPES_REGISTERED() {return BLOCKLY_BTS_REG}

    static get HistoryBlockIdPrefix() {return "BuFF"}

    constructor() {
        super();

        this.area               = undefined;    // узел вставки контейнера
        this.container          = undefined;    // контейнер Blockly
        this.toolbox            = undefined;    // узел с описанием типов блоков
        this.dimmer             = undefined;    // слой затемнения
        this.workspace          = undefined;    // SVG-контейнер с графикой Blockly

        // Блоки
        this._block_types       = undefined;    // JSON-типы блоков
        this._generators        = undefined;    // JS-генератор кода
        this._audibles          = undefined;    // Прослушиваемые типы блоков

        // Флаги
        this.silent             = false;        // "тихий" режим, не обрабатывать события
        this.extra_fields       = false;        // режим доп. полей, для админки
        this.safe_positions     = true;         // защита от выноса блоков за тулбокс

        // Прочее
        this._error_blocks      = {};           // блоки, помеченные как ошибочные
        this._variable_blocks   = [];           // блоки-переменные
        this._history_blocks    = [];           // блоки истории
        this._history_counter   = 0;            // счётчик истории
        this._history_limit     = 10;           // максимальное количество блоков в истории
        this._history_root_id   = undefined;
        this._read_only         = undefined;

        this._flyout_width_nonzero      = undefined;
        this._container_width             = undefined;

        this._state = {
            lastCodeMain: undefined,            // последнее состояние главного кода
            changeListenerRegistered: false,    // зарегистрирован ли обработчик событий изменения
            code_buffer: undefined              // буфер кода, используется при встраивании-удалении
        };

        this._callbacks = {
            onChange: (statement) => {
                this._debug.warn("onChangeMain default callback was called", statement)
            },
            onChangeAudible: (block_code, statement) => {
                this._debug.warn("onChangeAudible default callback was called", block_code, statement)
            }
        };

        // Конфигурация Blockly
        Blockly.HSV_SATURATION = 1;
        Blockly.HSV_HUE = 1;
    }

    /**
     * Зарегистрировать типы блоков в Blockly
     *
     * Формат входных данных см. в разделах Block Definition и Define Blocks
     * (во вкладках JavaScript)
     *
     * @see https://developers.google.com/blockly/guides/configure/web/custom-blocks
     * @see https://developers.google.com/blockly/guides/create-custom-blocks/define-blocks
     *
     * @param {Object} blocksJSON объект формата Blockly (JavaScript), задающий определения блоков
     */
    registerBlockTypes(blocksJSON) {
        this._block_types = blocksJSON;

        this._loadBlocksJSON();

        BLOCKLY_BTS_REG = true;
    }

    /**
     * Зарегистрировать генераторы кода в Blockly
     *
     * Формат входных данных см. в разделе Add Generator Function
     *
     * @see https://developers.google.com/blockly/guides/configure/web/custom-blocks
     *
     * @param {Object} generatorsJS объект формата Blockly (JavaScript), задающий определения генераторов
     */
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
        /// Зафиксировать флаг режима только чтения
        this._read_only = read_only;

        /// Сгенерировать контейнеры для Blockly и для типов блоков
        this.container   = document.createElement('div');
        this.toolbox     = document.createElement('xml');
        this.dimmer     = document.createElement('div');
        /// Задать контейнерам соответствующие идентификаторы
        this.container.setAttribute("id", DIV_IDS.BLOCKLY);
        this.toolbox.setAttribute("id", DIV_IDS.TOOLBOX);

        if (!read_only) {
            this.dimmer.setAttribute("id", DIV_IDS.DIMMER);
            this.dimmer.setAttribute("style", this._getDimmerStyle());
            this.unlock();
        }

        this.toolbox.style.display = 'none';

        /// Разместить контейнеры в DOM-дереве
        dom_node.appendChild(this.dimmer);
        dom_node.appendChild(this.container);
        dom_node.appendChild(this.toolbox);

        /// Встроить Blockly в заданную систему контейнеров
        this.workspace = Blockly.inject(
            this.container,
            {
                toolbox: this.toolbox,
                readOnly: read_only,
                sounds: false,
                zoom: {
                    startScale: zoom_initial
                },
                scrollbars: use_scrollbars,
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
        // this.resize();

        this._getFlyoutWidth(true);

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
        this.dimmer.remove();
        this.container.remove();
        this.toolbox.remove();

        // window.removeEventListener('resize', this._onResize, false);
    }

    /**
     * Изменить размер графики Blockly
     *
     * @see https://developers.google.com/blockly/guides/configure/web/resizable
     *
     * @private
     */
    resize(shrink=false) {
        this.container.style.width   = (this.area.offsetWidth - 24) + 'px';
        this.container.style.height  = (this.area.offsetHeight - 24) + 'px';
        Blockly.svgResize(this.workspace);
        // this._alignHistoryBlockSequence();

        if (shrink && this._container_width_old) {
            let container_width_new = this._getContainerWidth() + 48;

            let frac = container_width_new / this._container_width_old;

            if (frac > 0) {
                this._shrinkBlocksToFit(container_width_new);
            }
        }

        this._container_width_old = this._getContainerWidth();
    }

    /**
     * Заблокировать редактор
     *
     * Сопровождается затемнением контейнера
     *
     * @returns {boolean} возможна ли блокировка/разблокировка
     */
    lock() {
        if (!this.dimmer) {return false}

        this.dimmer.className = this.dimmer.className.replace(new RegExp(`(?:^|\\s)${DIV_CLASSES.DIMMER_HIDDEN}(?!\\S)`) ,'');

        return true;
    }

    /**
     * Разблокировать редактор
     *
     * @returns {boolean} возможна ли блокировка/разблокировка
     */
    unlock() {
        if (!this.dimmer) {return false}

        let classes = this.dimmer.className.split(" ");
        if (classes.indexOf(DIV_CLASSES.DIMMER_HIDDEN) === -1) {
            this.dimmer.className += " " + DIV_CLASSES.DIMMER_HIDDEN;
        }
    }

    /**
     * Очистить редактор от кода
     *
     * @returns {boolean} возможна ли очистка редактора
     */
    clear() {
        if (!this.workspace) {return false}

        this.workspace.clear();
    }

    /**
     * Обновить предел допустимого количества блоков
     *
     * @param   {?number}    block_limit максимально допустимое количество блоков
     * @returns {boolean}    возможно ли обновление предела
     */
    updateBlockLimit(block_limit) {
        if (!this.workspace) {return false}
        if (this._read_only) return;

        block_limit = block_limit > 0 ? block_limit : 9999;

        this.workspace.options.maxBlocks = block_limit;
        this.workspace.flyout_.filterForCapacity_();

        return true;
    }

    /**
     * Обновить типы блоков
     *
     * Обновляется список допустимых типов блоков в редакторе
     *
     * @param {Array<Object>} block_types массив объектов типа {тип_блока: макс. кол-во}
     */
    updateBlockTypes(block_types) {
        if (this._read_only) return;

        let toolbox_content = "";

        let block_type_array = Array.isArray(block_types) ? block_types : Object.keys(block_types);

        for (let block_type of block_type_array) {
            toolbox_content += "<block type='" + block_type + "'></block>";
        }

        this.toolbox.innerHTML = toolbox_content;

        this.workspace.updateToolbox(this.toolbox);

        this._getFlyoutWidth();
    }

    /**
     * Подсветить блок
     *
     * Блок с указанным ID подсвечивается (становится ярче).
     * Если на момент вызова функции в коде уже существуют подсвеченные блоки,
     * их подсветка исчезает
     *
     * @param {string} block_id идентифиактор блока в набранном коде
     */
    highlightBlock(block_id) {
        this.workspace.highlightBlock(block_id);
    }

    /**
     * Подсветить блок как ошибочный
     *
     * Блок с указанным ID изменяет цвет на цвет ошибочного блока ({@link ERROR_COLOUR})
     *
     * @param {string} block_id идентифиактор блока в набранном коде
     */
    highlightErrorBlock(block_id) {
        let block = this.workspace.getBlockById(block_id);
        let colour = block.getColour(ERROR_COLOUR);

        block.setColour(ERROR_COLOUR);

        this._error_blocks[block_id] = {colour: colour, block: block};
    }

    /**
     * Очистить подсветку у ошибочных блоков
     */
    clearErrorBlocks() {
        for (let block_id of Object.keys(this._error_blocks)) {
            let block = this._error_blocks[block_id].block;
            let colour = this._error_blocks[block_id].colour;

            block.setColour(colour);

            delete this._error_blocks[block_id];
        }
    }

    /**
     * Возвратить список типов блоков, используемых в коде
     *
     * Функция фозвращает массив строк, идентифицирующих типы блоков, которые исользуются в коде
     * на момент вызова функции
     *
     * @returns {Array<string>|boolean} список типов блоков / false, если операция невозможна
     */
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
     * Возвратить достаточное (но не всегда необходимое) число блоков
     * для сборки текущей последовательности блоков
     *
     * @returns {number} число блоков
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
                        block_count += 1; // maybe 2?
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
     * Возвратить значения полей, определяющих максимально допустимое количество блоков,
     * по всем типам блоков
     *
     * @returns {Array<Object>} массив объектов типа {тип_блока: макс. кол-во}
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

    /**
     * Установить значения полей, определяющих максимально допустимое количество блоков,
     * по всем типам блоков
     *
     * @param block_counts {Array<Object>} массив объектов типа {тип_блока: макс. кол-во}
     */
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
     * @see https://developers.google.com/blockly/guides/get-started/web
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
     * Обработчик - последовательность команд, которая срабатывает
     * при нажатии на клавишу с соответствующим кодом.
     *
     * Главный обработчик - обработчик, срабатывающий при нажатии кнопки "Запустить".
     *
     * Формат списка обработчиков:
     *
     * `{{main: string, sub: Object}}`,
     *
     * где ключ `main` указывает на главный обработчик.
     *
     * Ключ `sub` указывает на объект, содержащий обработчики нажатий клавиш:
     * каждый его ключ - ID блока-обработчика, указывающий на объект типа
     *
     * {btn: number, code: string},
     *
     * где btn - код клавиши, нажатие которой обрабатывается, code - обработчик её нажатия.
     *
     * @returns {{main: string, sub: Object}}
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
     *  О пределе уровня вложенности см. {@link _filterEvent}
     *
     * @param callback  функция обратного вызова, в которую при глубоких изменениях будут передаваться
     *                  следующие параметры:
     *                      - {string} код изменённого блока-родителя
     *                      - {string} вложенный код блока-родителя (если изменён)
     */
    onChangeAudible(callback) {
        this._callbacks.onChangeAudible = callback;
    }

    //
    // ОТОБРАЖЕНИЕ ПЕРЕМЕННЫХ
    //

    /**
     * Добавить блок-переменную
     *
     * @param {string}              block_type  тип блока-переменной
     * @param {string}              field_type  тип значения переменной ({@link FIELD_TYPES})
     * @param {?string|number}      field_value значение переменной по умолчанию
     */
    addVariableBlock(block_type, field_type=FIELD_TYPES.STRING, field_value=0) {
        let block = this.workspace.newBlock(block_type);

        block.setOutput(false);

        block.initSvg();
        block.render();

        // let variable_name = "";
        let pos_x = this._getAllVariablesWidth();
        // let pos_y = this._getAllVariablesHeight();

        // try {
        //     variable_name = block.inputList[0].fieldRow[0].text_;
        // } catch (e) {
        //     console.error("Variable block of type `" + block_type + "` has not a dummy input at 0 index");
        // }

        this._addFieldToVariableBlock(block, field_type);

        // block.setFieldValue(variable_name + " = ");
        // block.setFieldValue("");
        block.setFieldValue(field_value, "DUMMY");
        block.moveBy(pos_x, 0);

        this._variable_blocks[block_type] = {
            // name: variable_name,
            element: block,
            pos_x: pos_x,
            // pos_y: pos_y,
        };
    }

    /**
     * Очистить блоки-переменные
     */
    clearVariableBlocks() {
        for (let block_type in this._variable_blocks) {
            this._variable_blocks[block_type].element.dispose();
        }

        this._variable_blocks = [];
    }

    /**
     * Задать значение блоку-переменной
     *
     * @param {string}          type    тип значения переменной ({@link FIELD_TYPES})
     * @param {?string|number}  value   значение переменной по умолчанию
     */
    setVariableBlockValue(type, value=0) {
        let block = this._variable_blocks[type];

        if (!block) {throw new RangeError("Variable of type `" + type + "`does not exist in the ui")}

        block.element.setFieldValue(value, "DUMMY");

        this._setHistoryBlockRootVariable(type, value);
    }

    //
    // ОТОБРАЖЕНИЕ ИСТОРИИ
    //

    /**
     * Добавить блок к истории
     *
     * @param {string}                  block_id        идентификатор блока
     * @param {Blockly.WorkspaceSvg}    workspace_src   исходная рабочая область
     */
    addHistoryBlock(block_id, workspace_src) {
        console.time('blkAlloc');
        // изменить буфер блоков истории
        this._allocateHistoryBlock(block_id, workspace_src);
        console.timeEnd('blkAlloc');
        console.time('blkSeqDisp');
        // отобразить все блоки истории
        this._displayHistoryBlockSequence();
        console.timeEnd('blkSeqDisp');
        console.time('blkSeqAlign');
        // выровнять объединённый блок
        this._alignHistoryBlockSequence();
        console.timeEnd('blkSeqAlign');
    }

    /**
     * Очистить блоки истории
     */
    clearHistoryBlocks() {
        this._removeHistoryBlockSequence();

        this._history_blocks = [];
        this._history_counter = 0;
    }

    /**
     * Скопировать блок истории из какой-либо рабочей области
     * и разместить этот блок в буфере
     *
     * @see https://groups.google.com/forum/#!topic/blockly/7lx0ctULeoQ
     *
     * @param {string}                  block_id        идентификатор блока в исходной рабочей области
     * @param {Blockly.WorkspaceSvg}    workspace_src   исходная рабочая область
     *
     * @private
     */
    _allocateHistoryBlock(block_id, workspace_src) {
        if (!block_id || !workspace_src) {
            throw new TypeError("Cannot allocate history block: incorrect parameters");
        }

        /// Для того, чтобы работал getElementById, необходимо:

        // DOM воркспейса перевести в текст
        let wssrc_text = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace_src));
        // создать парсер на основе воркспейса
        let sourceXML = new DOMParser().parseFromString(wssrc_text, "text/xml");

        // найти блок
        let oldNode = sourceXML.getElementById(block_id);

        // если блок не удаётся найти
        if (!oldNode) {
            throw new RangeError(`Cannot find block ${block_id} in workspace ${workspace_src.id}`);
        }

        // если тег - не блок (напр. <shadow>)
        if (oldNode.tagName !== 'block') {
            throw new RangeError(`Element ${block_id} is not a block`);
        }

        // скопировать блок
        let newNode = oldNode.cloneNode(true);
        // сгенерироать id нового блока
        let newNodeBuffId = this._generateHistoryBlockId();

        // установить id и очистить положение блока
        newNode.setAttribute('id', newNodeBuffId);
        newNode.setAttribute('x', 0);
        newNode.setAttribute('y', 0);

        // удалить лишние next-теги, если таковые есть
        let nexts = newNode.getElementsByTagName("next");

        for (let next of nexts) {
            next.remove();
        }

        // доавить новый блок в историю
        this._history_blocks.push({buff_id: newNodeBuffId, node: newNode});

        if (this._history_blocks.length > this._history_limit) {
            this._history_blocks.shift();
            this._history_counter--;
        }
    }

    /**
     * Сгенерировать новый идентификатор блока истории
     *
     * @returns {string} идентификатор блока истории
     *
     * @private
     */
    _generateHistoryBlockId() {
        let prefix = BlocklyWrapper.HistoryBlockIdPrefix + this._history_counter;

        this._history_counter++;

        return prefix;
    }

    /**
     * Отобразить последовательность блоков истории
     *
     * Удаляет старую последовательность блоков, если таковая отображается
     * Объединяет все блоки, занесённые в историю, в единую последовательность
     * Вставляет последовательность в рабочую область Blockly
     *
     * TODO: Аддитивно, не перестраивать. Нужна оптимизация
     *
     * @private
     */
    _displayHistoryBlockSequence() {
        let parser = new DOMParser().parseFromString("", "text/xml");

        this._removeHistoryBlockSequence();

        let last_blk_node, last_blk_id;

        for (let blk of this._history_blocks) {
            let blk_node = blk.node.cloneNode(true);
            last_blk_id = blk.buff_id;

            if (!last_blk_node) {
                last_blk_node = blk_node;
            } else {
                let next = parser.createElement("next");
                next.appendChild(last_blk_node);
                blk_node.appendChild(next);

                last_blk_node = blk_node;
            }
        }

        this._history_root_id = last_blk_id;
        this.workspace.paste(last_blk_node);
    }

    /**
     * Удаляет текущую последовательность блоков из рабочей области
     *
     * Удаляется лишь объединённая (отображаемая) последовательность блоков,
     * а сами блоки истории сохраняются
     *
     * @private
     */
    _removeHistoryBlockSequence() {
        if (this._history_root_id in this.workspace.blockDB_) {
            let block_root = this.workspace.getBlockById(this._history_root_id);
            this._disposeBlockSequence(block_root);
        }
    }

    /**
     *
     * Установить значение переменной у корневого блока истории
     *
     * TODO: доделать после оптимизации истории
     *
     * @param {number}          block_type  тип блока-переменной, значение которой изменилось
     * @param {number|string}   value       значение блока-переменной, которое требуется установить
     *
     * @returns {boolean} успех операции
     *
     * @stub
     * @private
     */
    _setHistoryBlockRootVariable(block_type, value) {
        // if (!block_type || value == null) {
        //     throw TypeError("Cannot set history root variable value: incorrect parameters");
        // }
        //
        // if (!(this._history_root_id in this.workspace.blockDB_)) {
        //     return false;
        // }
        //
        // let block_root = this.workspace.getBlockById(this._history_root_id);
        //
        // for (let subblock of block_root.getChildren()) {
        //     if (subblock.type === block_type) {
        //         if (subblock.inputList.length > 0 && subblock.inputList[0].fieldRow.length > 0) {
        //             subblock.inputList[0].fieldRow[0].text = value;
        //         }
        //     }
        // }
    }

    /**
     * Выровнять последовательность блоков истории, отображаемую в данный момент
     *
     * @private
     */
    _alignHistoryBlockSequence() {
        // Если история отображается
        if (this._history_root_id in this.workspace.blockDB_) {
            // Найти корневой блок истории
            let block_root = this.workspace.getBlockById(this._history_root_id);

            let dx = (this.container.offsetWidth / 2) - (this._getHistoryBlockSequenceAverageWidth() / 2);
            let dy = (this._getAllVariablesHeight());

            let pos = block_root.getRelativeToSurfaceXY();

            dx -= pos.x - 40;
            dy -= pos.y - 40;

            block_root.moveBy(dx, dy);
        }
    }

    /**
     * Удалить последовательность блоков
     *
     * @param {Blockly.BlockSvg} block корневой блок последовательности, которую требуется удалить
     *
     * @private
     */
    _disposeBlockSequence(block) {
        let block_next = block.getNextBlock();

        if (block_next) {
            this._disposeBlockSequence(block_next);
        }

        block.dispose();
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

    /**
     * Добавить поле блоку-переменной
     *
     * @param {Blockly.BlockSvg}   block      блок-переменная
     * @param {string}             field_type тип значения переменной ({@link FIELD_TYPES})
     *
     * @private
     */
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

    /**
     * Определить высоту, занимаемую всеми блоками-переменными
     *
     * @returns {number} высота в px
     *
     * @private
     */
    _getAllVariablesHeight() {
        let height_sum = 0;

        for (let block_type in this._variable_blocks) {
            height_sum += this._variable_blocks[block_type].element.height;
            height_sum += VARIABLE_OFFSET_Y;
        }

        return height_sum;
    }

    /**
     * Определить ширину, занимаемую всеми блоками-переменными
     *
     * @returns {number} ширина в px
     *
     * @private
     */
    _getAllVariablesWidth() {
        let width_sum = 0;

        for (let block_type in this._variable_blocks) {
            width_sum += this._variable_blocks[block_type].element.width;
            width_sum += VARIABLE_OFFSET_X;
        }

        return width_sum;
    }

    _getHistoryBlockSequenceAverageWidth() {
        // Если история не отображается
        if (!(this._history_root_id in this.workspace.blockDB_)) {
            return 0;
        }

        // Извлечь корневой блок истории
        let block = this.workspace.getBlockById(this._history_root_id);

        let widths = [];

        while (block) {
            widths.push(block.width);
            block = block.getNextBlock();
        }

        return widths.reduce((a, b) => a + b, 0) / widths.length;
    }

    /**
     * Определить стиль диммера
     *
     * @private
     */
    _getDimmerStyle() {
        return "position: absolute; width: 100%; height: 100%; z-index: 21;";
    }

    _getFlyoutWidth(last_nonzero=false) {
        if (!this.workspace.flyout_) {
            return last_nonzero ? this._flyout_width_nonzero : 0;
        }

        this._flyout_width_nonzero = this.workspace.flyout_.width_;

        return this.workspace.flyout_.width_;
    }

    _getContainerWidth() {
        // 15 is the Blockly padding
        return this.container.offsetWidth;
    }

    /**
     * Расположить блоки таким образом, чтобы они вмещались в контейнер
     *
     * @param {integer} cw_absolute абсолютная ширина контейнера
     *
     * @private
     */
    _shrinkBlocksToFit(cw_absolute) {
        // console.group("SHRNK");

        // Корневые блоки цепочек
        let blocks = this.workspace.getTopBlocks();

        let pos_min = Infinity;
        let pos_max = -Infinity;

        if (blocks.length === 0) {
            // console.log("noblocks");
            // console.groupEnd("SHRNK");
            return;
        }

        setTimeout(() => {
            let blocks = this.workspace.getTopBlocks();

            for (let block of blocks) {
                // исходное положение блоков
                let crd = block.getRelativeToSurfaceXY();

                let pos_begin = crd.x,
                    pos_end = crd.x + block.width;

                if (pos_begin < pos_min) pos_min = pos_begin;
                if (pos_end > pos_max) pos_max = pos_end;
            }

            let cw_required = cw_absolute;
            let cw_engaged = (pos_max - pos_min);

            let squeeze = cw_required / cw_engaged;
                squeeze = squeeze > 1 ? 1 : squeeze;

            let center_required = cw_required / 2;
            let center_engaged = (pos_min + cw_engaged / 2) * squeeze;

            // console.log("Squeeze", squeeze);
            // console.log("CWreq", cw_required, "CWeng", cw_engaged);
            // console.log("CENreq", center_required, "CENeng", center_engaged);

            let center_diff = (center_required - center_engaged);

            // console.log("Center diff", center_diff);

            for (let block of blocks) {
                let crd_cur = block.getRelativeToSurfaceXY();

                let pos_old = crd_cur.x;
                let pos_new = crd_cur.x * squeeze + center_diff;

                let diff = pos_new - pos_old;

                // console.log("Total diff", diff);
                // console.groupEnd("ITEM");

                // Move here
                block.moveBy(diff, 0);
            }

            this._pickOutBlocksFromFlyout();
        }, 0);

        // console.groupEnd("SHRNK");
    }

    _pickOutBlocksFromFlyout(individual=false) {
        let flyout_width = this._getFlyoutWidth(),
            blocks = this.workspace.getTopBlocks(),
            diff = flyout_width,
            is_under = false;

        if (individual) {
            for (let block of blocks) {
                let pos_x = block.getRelativeToSurfaceXY().x;

                if (pos_x < flyout_width) {
                    block.moveBy(flyout_width - pos_x, 0);
                }
            }

            return;
        }

        for (let block of blocks) {
            let pos_x = block.getRelativeToSurfaceXY().x;

            if (pos_x < flyout_width) {
                diff = diff > pos_x ? pos_x : diff;
                is_under = true;
            }
        }

        if (is_under) {
            for (let block of blocks) {
                block.moveBy(flyout_width - diff, 0);
            }
        }
    }

    /**
     * Выполнить первичную обработку стандартных событий Blockly
     *
     * Обнаруживаются глубокие изменения для блоков-обработчиков, задаваемых
     * с помощью функции {@link setAudibles}
     *
     * @param event событие Blockly
     *
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

        if (event.type === Blockly.Events.MOVE) {
            let block = this.workspace.getBlockById(event.blockId);

            if (block) {
                let pos_x = block.getRelativeToSurfaceXY().x,
                    flyout_width = this._getFlyoutWidth();

                if (pos_x < flyout_width) {
                    block.moveBy(flyout_width - pos_x, 0);
                }
            }
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