import Module from "../core/Module";

import SpinnerWrapper from "../wrappers/SpinnerWrapper";
import LessonPaneWrapper from "../wrappers/LessonPaneWrapper";
import TextPaneWrapper from "../wrappers/TextPaneWrapper";
import FileWrapper from "../wrappers/FileWrapper";

/**
 * Модуль, управляющий базовым функциями графического интерфейса
 * и выполняющий первичную обработку его событий.
 *
 * Отвечает за нажатия всех кнопок, нажатие всех клавиш,
 * выгрузку и загрузку файлов.
 *
 */
class GUIModule extends Module {
    static get eventspace_name() {return "gui"}
    static get event_types() {return ["mission", "switch", "check", "execute", "stop", "keyup", "load-file", "unload-file"]}

    static defaults() {
        return {
            anyKey: false,  // отключить фильтрацию клавиш
        }
    }

    constructor(options) {
        super(options);

        this._button_codes = [];

        this._state = {
            switched: true, // debug only
            listen_buttons: false,

            areasDisp: {
                text: false,
                lesson: false
            }
        };

        this._task_description = undefined;

        this._filer = new FileWrapper();
        this._spinner = new SpinnerWrapper();
        this._lesson_pane = new LessonPaneWrapper();
        this._text_pane = new TextPaneWrapper();

        this._subscribeToWrapperEvents();
    }

    hideSpinner() {
        this._spinner.hide();
    }

    showSpinnerError(message) {
        this._spinner.setTextError(message);
    }

    showMissionButtons(missions) {
        return new Promise((resolve, reject) => {
            if (!missions) {return resolve(false)}

            this._state.areasDisp.lesson = true;

            this._lesson_pane.registerMissions(missions);
            this._lesson_pane.displayMissionButtons($("#missions"));

            resolve(true);
        });
    }

    showTask(html) {
        this._text_pane.setText(html);

        return Promise.resolve();
    }

    injectTextPane(dom_node) {
        if (!dom_node)                  {return Promise.resolve(false)}
        if (this._state.areasDisp.text) {return Promise.resolve(true)}

        this._state.areasDisp.text = true;

        return this._text_pane.inject(dom_node);
    }

    ejectTextPane() {
        if (!this._state.areasDisp.text) {return Promise.resolve(true)}

        this._state.areasDisp.text = false;

        return this._text_pane.eject();
    }

    /**
     * Назначить допустимые коды клавиш для фильтрации
     *
     * @param {Array} button_codes массив кодов клавиш
     */
    registerButtonCodes(button_codes) {
        if (!Array.isArray(button_codes)) {
            throw new TypeError("setButtonCodes(): button codes should be an Array instance");
        }

        this._button_codes = button_codes;
    }

    /**
     * Прослушивать ли нажатия клавиш
     *
     * @param {boolean} on true - включить прослушивание, иначе - выключить
     */
    listenButtons(on) {
        this._state.listen_buttons = on;
    }

    /**
     * Выгрузить строку в файл
     *
     * После вызова функции последует вывод диалогового окна
     * с запросом на указание пути и имени нового файла
     *
     * @param str {String} исходная строка для сохранения
     */
    saveToFile(str) {
        this._filer.saveStrToFile("codehour-sample-code.txt", str);
    }

    /**
     * Загрузить строку из файла
     *
     * Процедура асинхронная, поэтому по результату обработки файла
     * генерируется событие "load-file"
     *
     * @param {File} file исходный файл
     */
    loadFromFile(file) {
        this._filer.readStrFromFile(file)
            .then(str => this.emitEvent("load-file", str));
    }

    /**
     * Отфильтровать событие нажатия клавиши
     *
     * Тип события (keydown, keypress, keyup) не имеет значения
     *
     * @param {Integer} keycode код нажатой клавиши
     * @returns {Integer|bool} true, если код прошёл через фильтр, код нажатой клавиши; иначе false
     * @private
     */
    _filterKeyEvent(keycode) {
        if (this._button_codes.indexOf(keycode) >= 0 || this._options.anyKey) {
            return keycode;
        }

        return false;
    }

    _subscribeToWrapperEvents() {
        /* Как только нажата кнопка переключения разметки */
        $("#switch-btn").click(() => {
            this._state.switched = !this._state.switched;
            this.emitEvent("switch", this._state.switched);

            this._debug.log('Switch clicked: ', this._state.switched);
        });

        this._lesson_pane.onButtonClick(idx => {
            this.emitEvent("mission", idx);
        });

        /* Как только нажата кнопка проверки */
        $("#check-btn").click(() => {
            this.emitEvent("check");
        });

        /* Как только нажата кнопка запуска кода */
        $("#launch-btn").click(() => {
            this.emitEvent("execute");
        });

        /* Как только нажата кнопка останова кода */
        $("#stop-btn").click(() => {
            this.emitEvent("stop");
        });

        /* Когда нажата кнопка загрузки файла */
        $(" #load-btn").change((evt) => {
            this.loadFromFile(evt.target.files[0]);
        });

        /* Как только нажата кнопка выгрузки кода */
        $("#unload-btn").click(() => {
            this.emitEvent("unload-file");
        });

        /* Как только нажата клавиша */
        $(document).keyup(event => {
            if (this._state.listen_buttons) {
                if (this._filterKeyEvent(event.which)) {
                    this.emitEvent("keyup", event.which);
                }
            }
        });
    }
}

export default GUIModule;