import Module from '../core/Module'

import BlocklyWrapper from '../wrappers/BlocklyWrapper'

import JSONBlocks       from '../utils/blockly/extras/blocks';
import JSONGenerators   from '../utils/blockly/extras/generators';

/**
 * Модуль "Рабочая область"
 *
 * Предоставляет набор методов для управления интерфейсом Blockly
 */
export default class WorkspaceModule extends Module {
    static get eventspace_name() {return "ws"}
    static get event_types() {return ["ready", "change"]}

    static defaults() {
        return {
            allBlocks: false,
            useScrollbars: false,
            zoomInitial: 0.7
        }
    }

    /**
     * Создать экземпляр рабочей области
     *
     * @param {Object} options опции модуля в формате, задаваемом в методе {@link defaults}
     */
    constructor(options) {
        super(options);

        this._blockly  = new BlocklyWrapper();

        this.shutUp();

        this._state = {
            display: false,
            block_types: [],
            pause: 0.2,
        };

        this._code_storage = [];

        this._blockly.registerBlockTypes(JSONBlocks);
        this._blockly.registerGenerators(JSONGenerators);

        this._blockly.setAudibles([
            'event_key_onpush_letter',
            'event_key_onpush_number',
            'event_key_onpush_any',
            'event_key_onpush_any_number'
        ]);

        this._subscribeToWrapperEvents();
    }

    get workspace() {
        if (!this._blockly.workspace) {
            throw new Error("Blockly has not been injected");
        }

        return this._blockly.workspace;
    }

    /**
     * Встроить рабочую область в DOM-узел
     *
     * @param {HTMLElement} dom_node    DOM-узел, в который будет встроена рабочая область
     * @param {Boolean}     read_only   режим только чтения
     * @param {Number}      zoom_factor коэф. уменьшения масштаба блоков
     */
    inject(dom_node, read_only=false, zoom_factor=1) {
        return new Promise(resolve => {
            if (!dom_node) {resolve(false)}
            if (zoom_factor == null) {zoom_factor = 1}

            let zoom = this._options.zoomInitial * zoom_factor;

            this._blockly.inject(dom_node, this._options.useScrollbars, read_only, zoom);
            this._state.display = true;

            if (this._options.allBlocks) {
                this._blockly.updateBlockTypes(JSONGenerators);
            } else {
                this._blockly.updateBlockTypes(this._state.block_types);
            }

            resolve();
        });
    }

    /**
     * Извлечь рабочую область
     *
     * Метод не сбрасывает настройки отображения Blockly
     * и не изменяет его текущее состояние
     */
    eject() {
        if (!this._state.display) {return true}

        this._blockly.eject();
        this._state.display = false;
    }

    /**
     * Установить используемые блоки
     *
     * @param {Array} block_types массив строк с названиями типов блоков
     */
    setBlockTypes(block_types) {
        this._state.block_types = block_types;

        if (!this._state.display) {return true}

        this._blockly.updateBlockTypes(block_types);
    }

    getBlockTypes() {
        if (!this._state.display) {return false}

        return this._blockly.getBlockTypes();
    }

    /**
     * Подсветить блок
     *
     * Подсвеченный ранее блок гаснет.
     * Если в качестве идентификатора задать null, только гаснет подсвеченный ранее блок
     *
     * @param {String|null} block_id идентификатор блока
     */
    highlightBlock(block_id) {
        if (!this._state.display) {return false}

        this._blockly.highlightBlock(block_id);
    }

    /**
     * Выделить ошибочные блоки
     *
     * @param {Array<string>} block_ids идентификаторы блоков
     */
    highlightErrorBlocks(block_ids) {
        if (!this._state.display) {return false}

        for (let block_id of block_ids) {
            this._blockly.highlightErrorBlock(block_id);
        }
    }

    /**
     * Удалить выделения ошибочных блоков
     */
    clearErrorBlocks() {
        this._blockly.clearErrorBlocks();
    }

    flushPrograms() {
        this._code_storage = [];

        return true;
    }

    /**
     * Сохранить программный код для текущего упражнения
     *
     * @param {number} mission_id   ИД задания
     * @param {number} exercise_id  ИД упражнения
     *
     * @returns {boolean} было ли изменено состояние модуля
     */
    saveProgram(mission_id, exercise_id) {
        if (!this._state.display) {return false}

        if (!(mission_id in this._code_storage)) {
            this._code_storage[mission_id] = [];
        }

        this._code_storage[mission_id][exercise_id] = this._blockly.getXMLText();

        return true;
    }

    /**
     * Загрузить сохраненный для упражнения программный код
     *
     * @param {number} mission_id   ИД задания
     * @param {number} exercise_id  ИД упражнения
     *
     * @returns {boolean} было ли изменено состояние модуля
     */
    loadProgram(mission_id, exercise_id) {
        if (!this._state.display) {return false}

        this._blockly.clear();

        if (!(mission_id in this._code_storage)) {
            return false;
        }

        if (!(exercise_id in this._code_storage[mission_id])) {
            return false;
        }

        this._blockly.setXMLText(this._code_storage[mission_id][exercise_id]);

        return true;
    }

    /**
     * Возвратить несколько соседних блоков от текущего
     *
     * TODO
     *
     * @param {number} neighbours_amount количество соседних блоков (сверху и снизу)
     */
    getBlockMultiplet(neighbours_amount=3) {

    }

    /**
     * Установить предел количества блоков
     *
     * @param {number} [max_block_count=0] максимальное количество блоков
     */
    setMaxBlockLimit(max_block_count=0) {
        if (!this._state.display) {return false}

        this._blockly.updateBlockLimit(max_block_count)
    }

    /**
     * Установить режим редактирования
     *
     * @param [on=false] {boolean} вкл./выкл. режим редактирования
     */
    setEditable(on=false) {
        if (!this._state.display) {return false}

        if (on) {
            this._blockly.unlock();
        } else {
            this._blockly.lock();
        }
    }

    /**
     * Возвратить значения полей ввода пределов количества блоков по типам
     *
     * Формат возвращаемого объекта:
     *      - ключ:     {string} тип блока
     *      - значение: {number} предел количества блоков по типу
     *
     * @returns {Object},
     */
    getBlockLimitInputsByType() {
        if (!this._state.display) {return false}

        return this._blockly.getBlockLimitInputsByType();
    }

    /**
     * Установить значения полей ввода пределов количества блоков по типам
     *
     * @param block_counts {Object} , где
     *      - ключ:     {string} тип блока
     *      - значение: {number} предел количества блоков по типу
     */
    setBlockLimitInputsByType(block_counts) {
        if (!this._state.display) {return false}

        this._blockly.setBlockLimitInputsByType(block_counts);
    }

    /**
     * Определить число блоков, необходимое для сборки
     * текущей последовательности блоков
     *
     * @returns {bool|int} колиество блоков, необходимых для сборки текущей последовательности блоков
     */
    getBlockLimit() {
        if (!this._state.display) {return false}

        return this._blockly.getBlockLimit();
    }

    /**
     * Возвратить список обработчиков в формате объекта
     *
     * @returns {{commands:Array, button:number}} обработчик, включающий код клавиши и код программы
     */
    getMainHandler() {
        let handlers = this._blockly.getJSONHandlers();

        let code = WorkspaceModule._preprocessCode(handlers.main);

        return {commands: code, button: "None", pause: this._state.pause};
    }

    /**
     * Возвратить обработчик нажатия клавиши
     *
     * @param {number} btn_code код клавиши
     *
     * @returns {{commands:Array, button:number}} обработчик, включающий код клавиши и код программы
     */
    getButtonHandler(btn_code) {
        if (!this._state.display) {return null}

        let handlers = this._blockly.getJSONHandlers().sub;

        for (let id of Object.keys(handlers)) {
            let handler = handlers[id];

            if (handler.btn === btn_code) {
                handler.code = WorkspaceModule._preprocessCode(handler.code);

                return handler;
            }
        }

        return null;
    }

    /**
     * Возвратить набранные коды
     *
     * Формат возвращаемого объекта:
     *      - ключ: `main`/ ID блока-обработчика
     *      - значение: {commands: {Array}, button: {number}}, где `commands` - JSON-код программы, `button` - код клавиши
     *
     * @returns {Object} основной код и коды обработчиков
     */
    getAllHandlers() {
        if (!this._state.display) {return null}

        let handlers_result = null;

        try {
            let _handlers = this._blockly.getJSONHandlers();

            let code_main = WorkspaceModule._preprocessCode(_handlers.main);

            handlers_result = {main: {commands: code_main, btn: "None", pause: this._state.pause}};

            for (let block_id of Object.keys(_handlers.sub)) {
                handlers_result[block_id] = {
                    commands: WorkspaceModule._preprocessCode(_handlers.sub[block_id].code),
                    btn: _handlers.sub[block_id].btn,
                    pause: this._state.pause
                }
            }
        } catch (err) {
            this._debug.error(err);
            return handlers_result;
        }

        return handlers_result;
    }

    /**
     * Возвратить XML-дерево кода в виде строки
     *
     * @returns {string} строка с XML-деревом
     */
    getTree() {
        return this._blockly.getXMLText();
    }

    /**
     * Загрузить XML-дерево в виде строки
     *
     * @param   {string} tree дерево в виде строки
     *
     * @returns {boolean} false, если строка пустая или не задана
     */
    loadTree(tree) {
        if (!tree) {return false}

        this._blockly.setXMLText(tree);
    }

    /**
     * Разрешить обработку событий Blockly
     */
    wakeUp() {
        this._blockly.silent = false;
    }

    /**
     * Запретить обработку событий Blockly
     *
     * При отсутствии необходимости работы с Blockly
     * обработку событий желательно отключить, так как сложные процедуры могут
     * значительно повлиять на производительность всей среды
     */
    shutUp() {
        this._blockly.silent = true;
    }

    setPause(pause_val) {
        this._state.pause = pause_val;
    }

    /**
     * Заставить Blockly генерировать дополнительные поля (для админки)
     * Работает только с wakeUp()
     *
     * @param {boolean} on генерировать ли поля
     */
    generateExtraFields(on) {
        if (this._blockly.silent) {return false}

        this._blockly.extra_fields = !!on;

        return true;
    }

    /**
     * Обновить размер рабочей области
     *
     * Вызывать в случае, когда необходимо подогнать размер рабочей области
     * под размер её контейнера
     */
    resize() {
        if (this._state.display) {
            this._blockly._onResize();
        }
    }

    /**
     * Подписаться на события обёрток
     */
    _subscribeToWrapperEvents() {
        this._blockly.onChange(() => {
            this.emitEvent("change");
        });
        /**
         * При изменении главного кода
         */
        // this._blockly.onChangeMain(main_code => {
        //     this.emitEvent("change", {
        //         main: {
        //             commands:   main_code,
        //             btn:        "None"
        //         },
        //     });
        // });

        /* В момент изменения кода обработчиков Blockly */
        // this._blockly.onChangeAudible((audible_id, audible_args) => {
        //     audible_args.code = WorkspaceModule._preprocessCode(audible_args.code);
        //
        //     let data_to_send = {};
        //
        //     data_to_send[audible_id] = {
        //         btn:        audible_args.btn
        //     };
        //
        //     if (audible_args.code.length > 0) {
        //         data_to_send[audible_id].commands = audible_args.code;
        //     }
        //
        //     this.emitEvent("change", data_to_send);
        // });
    }

    /**
     * Предварительная обработка кода, генерируемого Blockly
     *
     * Преобразует строку в JSON-объект
     *
     * @param {string} code исходный код, сгенерированный в Blockly
     *
     * @returns {Object} JSON-версия исходного кода, сгенерированного в Blockly
     * @private
     */
    static _preprocessCode(code) {
        if (!code) return [];

        code = code.trim();

        if (code.slice(-1) === ",") {
            code = code.slice(0, -1);
        }

        return JSON.parse("[" + code + "]");
    }
}