import Module from "../core/Module";

import SpinnerWrapper from "../wrappers/SpinnerWrapper";
import LessonPaneWrapper from "../wrappers/LessonPaneWrapper";
import TextPaneWrapper from "../wrappers/TextPaneWrapper";
import LaunchBtnWrapper from "../wrappers/LaunchBtnWrapper";
import FileWrapper from "../wrappers/FileWrapper";
import AlertifierWrapper from "../wrappers/AlertifierWrapper";

const BOARD_STATUSES = {
    SEARCH: 'search',
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    NONE: 'none',
};

const HASH_TYPES = {
    GOTO: "goto",

    NONE: "none",
};

const REGEXPS = {
    MISSION_EXERCISE:   /^#m[0-9]+e[0-9]+$/g,
    MISSION:            /^#m[0-9]+$/g,
    EXERCISE:           /^#e[0-9]+$/g,

    NUMBERS:            /[0-9]+/g,
};

const LAUNCH_VARIANTS = {
    NONE: 0,
    CHECK: 1,
    EXECUTE: 2,
    CHECK_N_EXECUTE: 3,
};

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
    static get event_types() {return ["ready", "mission", "run", "stop", "check", "keyup", "hash-command", "menu", "load-file", "unload-file"]}

    static defaults() {
        return {
            anyKey: false,  // отключить фильтрацию клавиш
            logoText: "Tapanda",
            imagesPath: "",
            devMode: false,
        }
    }

    constructor(options) {
        super(options);

        this._button_codes = [];

        this._state = {
            ready: false,
            switched: true, // debug only
            listenButtons: false,
            launchVariant: false,

            areasDisp: {
                text: false,
                lesson: false,
                button: false,
            }
        };

        this._task_description = undefined;

        this._filer = new FileWrapper();
        this._spinner = new SpinnerWrapper();
        this._lesson_pane = new LessonPaneWrapper();
        this._text_pane = new TextPaneWrapper();
        this._launch_btn = new LaunchBtnWrapper();
        this._alertifier = new AlertifierWrapper();

        if (this._options.imagesPath) {
            this._alertifier.setImagesPath(this._options.imagesPath);
        }

        this._lesson_pane.registerLogoText(this._options.logoText);

        this._setMenuStructure();

        if (this._options.devMode) {
            this.switchDeveloperMode(true);
        } else {
            this.switchDeveloperMode(false);
        }

        this._subscribeToWrapperEvents();
    }

    hideSpinner() {
        this._spinner.hide();

        if (!this._state.ready) {
            this._state.ready = true;
            this.emitEvent("ready");
        }
    }

    showSpinnerError(message) {
        this._spinner.setTextError(message);
    }

    showMissionButtons(missions) {
        return new Promise((resolve, reject) => {
            if (!missions) {return resolve(false)}

            this._lesson_pane.registerMissions(missions);

            resolve(true);
        });
    }

    setMissionCurrent(mission_idx) {
        return new Promise((resolve, reject) => {
            this._lesson_pane.setMissionActive(mission_idx);

            resolve(true);
        });
    }

    setMissionProgress(mission) {
        return new Promise((resolve, reject) => {
            if (!mission) {return resolve(false)}

            this._lesson_pane.setMissionProgress(mission.missionIDX, mission.exerciseIDX);

            resolve(true);
        });
    }

    setMissionSkiddingOn(mission_idx) {
        return new Promise((resolve, reject) => {
            if (!mission_idx) {return resolve(false)}

            this._lesson_pane.setMissionSkidding(mission_idx, true);

            resolve(true);
        });
    }

    setExerciseCurrent(exercise_idx) {
        return new Promise((resolve, reject) => {
            console.log(exercise_idx);

            this._lesson_pane.setExerciseActive(exercise_idx);

            resolve(true);
        });
    }

    setCourseText(lesson_name) {
        return new Promise((resolve, reject) => {
            let text = "Урок: " + lesson_name;

            if (!this._state.areasDisp.lesson) {
                this._lesson_pane.registerCourseText(text);
            } else {
                this._lesson_pane.setCourseText(text);
            }

            resolve(true);
        });
    }

    setBoardStatus(status) {
        console.log("BS", status);
        switch (status) {
            case BOARD_STATUSES.SEARCH: {
                this.hideAllAlerts();
                this._lesson_pane.setStatus('warning');
                break;
            }
            case BOARD_STATUSES.CONNECT: {
                this.hideAllAlerts();
                this._lesson_pane.setStatus('success');
                break;
            }
            case BOARD_STATUSES.DISCONNECT: {
                this.showAlert('no_board');
                this._lesson_pane.setStatus('error');
                break;
            }
            case BOARD_STATUSES.NONE: {
                this._lesson_pane.setStatus('active');
                break;
            }
            default: {
                this._lesson_pane.setStatus('default');
                break;
            }
        }
    }

    showTask(html) {
        this._text_pane.setText(html);

        return Promise.resolve();
    }

    setLaunchVariant(variant) {
        if (!this._state.areasDisp.buttons)   {return Promise.resolve(false)}

        console.log("SLV", variant);

        switch (variant) {
            case LAUNCH_VARIANTS.NONE: {
                this._launch_btn.hide();
                break;
            }
            case LAUNCH_VARIANTS.CHECK: {
                this._launch_btn.show(0);
                break;
            }
            case LAUNCH_VARIANTS.EXECUTE: {
                this._launch_btn.show(1);
                break;
            }
            case LAUNCH_VARIANTS.CHECK_N_EXECUTE: {
                this._launch_btn.show(2);
                break;
            }
            default: {
                this._state.launchVariant = variant;
            }
        }

        this._state.launchVariant = !this._state.launchVariant;

        return Promise.resolve(true);
    }

    affirmLaunchButtonState(button, start=true) {
        if (!this._state.areasDisp.buttons) {return false}
        if (!button) {throw new TypeError("Button is not defined")}

        if (start) {
            this._launch_btn.setStart(button);
        } else {
            this._launch_btn.setStop(button);
        }
    }

    injectLaunchButtons(dom_node) {
        if (!dom_node)                      {return Promise.resolve(false)}
        if (this._state.areasDisp.buttons)   {return Promise.resolve(true)}

        this._state.areasDisp.buttons = true;

        return this._launch_btn.inject(dom_node);
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

    injectLessonPane(dom_node) {
        if (!dom_node)                  {return Promise.resolve(false)}
        if (this._state.areasDisp.lesson) {return Promise.resolve(true)}

        this._state.areasDisp.lesson = true;

        return this._lesson_pane.inject(dom_node);
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
        this._state.listenButtons = on;
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

    showAlert(type) {
        this._alertifier.alertIndelible(type);
    }

    showAlertInputCommand() {
        this._alertifier.alertInput('command')
            .then(command => {
                command = this._filterURLHashCommand(command);

                this.emitEvent("hash-command", command);
            });
    }

    hideAllAlerts() {
        this._alertifier.closeAll();
    }

    switchDeveloperMode(on) {
        this._lesson_pane.switchTask(on);
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

    _filterURLHashCommand(hash) {
        if (typeof hash !== "string") {throw new TypeError("URL Hash is not a string")}

        let mission_idx, exercise_idx;

        console.log(hash);

        if (hash.match(REGEXPS.MISSION_EXERCISE)) {
            [mission_idx, exercise_idx] = hash.match(REGEXPS.NUMBERS);
        }

        else if (hash.match(REGEXPS.MISSION)) {
            mission_idx = hash.match(REGEXPS.NUMBERS);
        }

        else if (hash.match(REGEXPS.EXERCISE)) {
            exercise_idx = hash.match(REGEXPS.NUMBERS);
        }

        else {
            return {
                type: HASH_TYPES.NONE,
            }
        }

        return {
            type: HASH_TYPES.GOTO,
            data: {
                missionIDX: Number(mission_idx),
                exerciseIDX: Number(exercise_idx),
            }
        };
    }

    _checkURLHashCommand() {
        let hash = window.location.hash;

        return this._filterURLHashCommand(hash);
    }

    _setMenuStructure() {
        this._lesson_pane.setMenuStructure([
            {
                type: 'default',
                name: "courses",
                text: "Курсы",
                handler: (name) => {this.emitEvent("menu", {name: name})}
            },
            {
                type: 'default',
                name: "settings",
                text: "Настройки",
                handler: (name) => {this.emitEvent("menu", {name: name})}
            },
            {
                type: 'radio',
                name: "developer",
                text: "Разработчик",
                handler: (name, pressed) => {this.emitEvent("menu", {name: name, state: pressed})}
            },
            {
                type: 'default',
                name: "command",
                text: "Выполнить",
                handler: () => {this.showAlertInputCommand()}
            },
            {
                type: 'disabled',
                name: "origin",
                text: window.location.host,
                right: true
            },
        ]);
    }

    _subscribeToWrapperEvents() {
        /* Как только нажата кнопка переключения разметки */
        // $("#switch-btn").click(() => {
        //     this._state.switched = !this._state.switched;
        //     this.emitEvent("switch", this._state.switched);
        //
        //     this._debug.log('Switch clicked: ', this._state.switched);
        // });

        /* Как только нажата кнопка запуса миссии */
        this._lesson_pane.onMissionClick(idx => {
            this.emitEvent("mission", idx);
        });

        this._lesson_pane.onMenuClick(() => {
            this.emitEvent("menu");
        });

        /* Как только нажата кнопка запуска/проверки */
        this._launch_btn.onButtonClick((button, start) => {
            if (button === 'check') {
                this.emitEvent("check");
            }

            if (button === 'execute') {
                if (start) {
                    this.emitEvent("run");
                } else {
                    this.emitEvent("stop");
                }
            }
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
            if (this._state.listenButtons) {
                if (this._filterKeyEvent(event.which)) {
                    this.emitEvent("keyup", event.which);
                }
            }
        });

        window.onhashchange = () => {
            let command = this._checkURLHashCommand();

            this.emitEvent("hash-command", command);
        }
    }
}

export default GUIModule;