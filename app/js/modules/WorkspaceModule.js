import Module from '../core/Module'

import BlocklyWrapper from '../wrappers/BlocklyWrapper'
import VirtLEDWrapper from '../wrappers/VirtLEDWrapper'

import JSONBlocks       from '../~utils/blockly/extras/blocks';
import JSONGenerators   from '../~utils/blockly/extras/generators';

/**
 * Модуль "Рабочая область"
 *
 * Предоставляет набор методов для управления интерфейсом Blockly
 */
class WorkspaceModule extends Module {
    static get eventspace_name() {return "ws"}
    static get event_types() {return ["ready", "change"]}

    static defaults() {
        return {
            allBlocks: false,
            useScrollbars: false
        }
    }

    constructor(options) {
        super(options);

        this._blockly  = new BlocklyWrapper();

        this.shutUp();

        this._state = {
            display: false,
            block_types: [],
        };

        this._blockly.registerBlockTypes(JSONBlocks);
        this._blockly.registerGenerators(JSONGenerators);

        this._blockly.setAudibles(['event_key_onpush_letter', 'event_key_onpush_number']);

        this._subscribeToWrapperEvents();
    }

    /**
     * Встроить рабочую область в DOM-узел
     *
     * @param {Element} dom_node DOM-узел, в который будет встроена рабочая область
     */
    inject(dom_node) {
        return new Promise(resolve => {
            if (!dom_node) {resolve(false)}

            this._blockly.inject(dom_node, this._options.useScrollbars);
            this._state.display = true;

            if (this._options.allBlocks) {
                this._blockly.updateBlockTypes(Object.keys(JSONGenerators));
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

    /**
     * Подсветить блок
     *
     * Подсвеченный ранее блок гаснет.
     * Если в качестве идентификатора задать null, только гаснет подсвеченный ранее блок
     *
     * @param {String|null} block_id идентификатор блока
     */
    highlightBlock(block_id) {
        this._blockly.highlightBlock(block_id);
    }

    highlightErrorBlocks(block_ids) {
        for (let block_id of block_ids) {
            this._blockly.highlightErrorBlock(block_id);
        }
    }

    clearErrorBlocks() {
        this._blockly.clearErrorBlocks();
    }

    getBlockMultiplet(neighbours_amount=3) {

    }

    /**
     * Получить список обработчиков в формате объекта
     *
     * @returns {{commands, button}} - {object} commands - JSON-код программы, {number} button - код клавиши
     */
    getMainHandler() {
        let handlers = this._blockly.getJSONHandlers();

        let code = WorkspaceModule._preprocessCode(handlers.main);

        return {commands: code, button: "None"};
    }

    /**
     * Получить обработчик нажатия клавиши
     *
     * @param {number} btn_code код клавиши
     * @returns {object} обработчик, включающий код клавиши и код программы
     */
    getButtonHandler(btn_code) {
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

    getAllHandlers() {
        try {
            let _handlers = this._blockly.getJSONHandlers();

            let code_main = WorkspaceModule._preprocessCode(_handlers.main);

            let handlers_result = {main: {commands: code_main, btn: "None"}};

            for (let block_id of Object.keys(_handlers.sub)) {
                handlers_result[block_id] = {
                    commands: WorkspaceModule._preprocessCode(_handlers.sub[block_id].code),
                    btn: _handlers.sub[block_id].btn
                }
            }
        } catch (err) {
            console.error(err);
            return {};
        }

        return handlers_result;
    }

    /**
     * Получить XML-дерево кода в виде строки
     *
     * @returns {String} строка с XML-деревом
     */
    getTree() {
        return this._blockly.getXMLText();
    }

    /**
     * Загрузить XML-дерево в виде строки
     *
     * @param   {String} tree дерево в виде строки
     * @returns {boolean} false, если строка пустая или не задана
     */
    loadTree(tree) {
        if (!tree) {return false}

        this._blockly.setXMLText(tree);
    }

    /**
     * Разрешить обработку событий Blockly
     *
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

    _subscribeToWrapperEvents() {
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
        this._blockly.onChangeAudible((audible_id, audible_args) => {
            audible_args.code = WorkspaceModule._preprocessCode(audible_args.code);

            let data_to_send = {};

            data_to_send[audible_id] = {
                btn:        audible_args.btn
            };

            if (audible_args.code.length > 0) {
                data_to_send[audible_id].commands = audible_args.code;
            }

            this.emitEvent("change", data_to_send);
        });
    }

    /**
     * Предварительная обработка кода, генерируемого Blockly
     *
     * Преобразует строку в JSON-объект
     *
     * @param {string} code исходный код, сгенерированный в Blockly
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

export default WorkspaceModule;