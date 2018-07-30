import Module from "../core/Module";

import SpinnerWrapper from "../wrappers/SpinnerWrapper";
import LessonPaneWrapper from "../wrappers/LessonPaneWrapper";
import TextPaneWrapper from "../wrappers/TextPaneWrapper";
import LaunchBtnWrapper from "../wrappers/LaunchBtnWrapper";
import FileWrapper from "../wrappers/FileWrapper";
import AlertifierWrapper from "../wrappers/AlertifierWrapper";
import HomeMenuWrapper from "../wrappers/HomeMenuWrapper";
import URLHashWrapper from "../wrappers/URLHashWrapper";

const BOARD_STATUSES = {
    SEARCH: 'search',
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    NONE: 'none',
};

/**
 * Модуль, управляющий базовыми функциями графического интерфейса
 * и выполняющий первичную обработку его событий
 *
 * Отвечает за обработку нажатий всех кнопок, нажатий всех клавиш,
 * выгрузку и загрузку файлов.
 */
export default class GUIModule extends Module {
    static get eventspace_name() {return "gui"}
    static get event_types() {return [
        "ready", "mission", "run", "stop", "check", "keyup", "hash-command", "menu", "load-file", "unload-file",
        "calc", "lesson", "reconnect"
    ]}

    static defaults() {
        return {
            anyKey: false,  // отключить фильтрацию клавиш
            logoText: "Tapanda",
            imagesPath: "",
            devMode: false,
            testMode: false,
            emphasize: false,
        }
    }

    constructor(options) {
        super(options);

        this._button_codes = [];

        this._state = {
            ready: false,
            switched: true, // debug only
            listenButtons: false,

            areasDisp: {
                text: false,
                lesson: false,
                button: false,
                home_menu: false,
            }
        };

        this._task_description = undefined;

        this._filer = new FileWrapper();
        this._spinner = new SpinnerWrapper();
        this._lesson_pane = new LessonPaneWrapper(this._options.emphasize);
        this._text_pane = new TextPaneWrapper();
        this._launch_btn = new LaunchBtnWrapper();
        this._alertifier = new AlertifierWrapper();
        this._home_menu = new HomeMenuWrapper();
        this._url_hash_parser = new URLHashWrapper();

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

        if (this._options.testMode) {
            this.switchTestMode(true);
        } else {
            this.switchTestMode(false);
        }

        this._subscribeToWrapperEvents();
    }

    /**
     * Скрыть загрузочный экран
     *
     * С момента запуска веб-страницы отображется графический слой,
     * включающий загрузочную анимацию. Как только приложение будет готов к работе,
     * этот слой нужно отключить.
     */
    hideSpinner() {
        this._spinner.hide();

        if (!this._state.ready) {
            this._state.ready = true;
            this.emitEvent("ready");
        }
    }

    /**
     * Отобразить текст ошибки на загрузочном экране
     *
     * Если в приложении произошла ошибка, а загрузочный экран ещё не отключён,
     * следует использовать эту функцию, чтобы сообщить пользователю об ошибке.
     *
     * @param {string} message текст ошибки
     */
    showSpinnerError(message) {
        this._spinner.setTextError(message);
    }

    /**
     * Показать кнопки заданий
     *
     * Информация о каждом задании представляется следующим форматом:
     * {
     *      'category': номер категории,
     *      'exercises': массив упражнений (см. ниже),
     *      'name': название задания (опционально)
     * }
     *
     * Информация о каждом упражнении представляется следующим форматом:
     * {
     *      mission: ID задания,
     *      pk: ID упражнения
     * }
     *
     * @param {Array<Object>} missions список заданий
     * @returns {Promise<any>}
     */
    showMissionButtons(missions) {
        return new Promise((resolve, reject) => {
            if (!missions) {return resolve(false)}

            this._lesson_pane.setMissions(missions);

            resolve(true);
        });
    }

    /**
     * Установить текущее задание
     *
     * @param {number} mission_idx индекс задания
     * @returns {Promise<any>}
     */
    setMissionCurrent(mission_idx) {
        return new Promise((resolve, reject) => {
            this._lesson_pane.setMissionActive(mission_idx);

            resolve(true);
        });
    }

    /**
     * Установить прогресс задания
     *
     * Информация о задании представляется с помощью сследующего формата:
     * {
     *      'missionIDX': номер задания,
     *      'exerciseCount': кол-во упражнений в задании,
     *      'exerciseIDX': текущее упражнение в задании
     * }
     *
     * @param {Object} mission информация о задании
     * @returns {Promise<any>}
     */
    setMissionProgress(mission) {return new Promise((resolve, reject) => {
            if (!mission) {return resolve(false)}

            this._lesson_pane.setMissionProgress(mission.missionIDX, mission.exerciseIDX);

            resolve(true);
        });
    }

    /**
     * Включить режим "пробуксовки" задания
     *
     * Режим "пробуксовки" - состояние задания, при котором номер текущего
     * упражнения не совпадает с номером последнего: например, пользователь отказался
     * переходить на следующее упражнение при прохождении текущего.
     *
     * @param {number} mission_idx индекс задания
     * @returns {Promise<any>}
     */
    setMissionSkiddingOn(mission_idx) {
        return new Promise((resolve, reject) => {
            if (!mission_idx) {return resolve(false)}

            this._lesson_pane.setMissionSkidding(mission_idx, true);

            resolve(true);
        });
    }

    /**
     * Установить текущее упражнение
     *
     * Выделяется указываемое упражнение текущего задания
     *
     * @param {number} exercise_idx индекс упражнения
     * @returns {Promise<any>}
     */
    setExerciseCurrent(exercise_idx) {
        return new Promise((resolve, reject) => {
            this._lesson_pane.setExerciseActive(exercise_idx);

            resolve(true);
        });
    }

    /**
     * Установить текст урока
     *
     * @param {string} lesson_name название урока
     * @returns {Promise<any>}
     */
    setLessonText(lesson_name) {
        return new Promise((resolve, reject) => {
            let text = "Урок: " + lesson_name;

            if (!this._state.areasDisp.lesson) {
                this._lesson_pane.registerLessonText(text);
            } else {
                this._lesson_pane.setLessonText(text);
            }

            resolve(true);
        });
    }

    /**
     * Установить статус платы
     *
     * @param status
     */
    setBoardStatus(status) {
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

    setLaunchButtonVariant(variant, is_sandbox) {
        if (!this._state.areasDisp.buttons)   {return Promise.resolve(false)}

        this._launch_btn.show(variant, is_sandbox);

        return Promise.resolve(true);
    }

    affirmLaunchButtonState(button, start=true) {
        if (!this._state.areasDisp.buttons) {return false}
        if (!button) {throw new TypeError("Button is not defined")}

        this._launch_btn.setState(button, start);
    }

    getLaunchButtonState(button) {
        if (!this._state.areasDisp.buttons) {return false}
        if (!button) {throw new TypeError("Button is not defined")}

        this._launch_btn.getState(button);
    }

    injectLaunchButtons(dom_node) {
        if (!dom_node)                      {return Promise.resolve(false)}
        if (this._state.areasDisp.buttons)   {return Promise.resolve(true)}

        this._state.areasDisp.buttons = true;

        return this._launch_btn.inject(dom_node);
    }

    ejectLaunchButtons() {
        if (!this._state.areasDisp.buttons)   {return Promise.resolve(true)}

        this._state.areasDisp.buttons = false;

        return this._launch_btn.eject();
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

    injectHomeMenu(dom_node) {
        if (!dom_node)                          {return Promise.resolve(false)}
        if (this._state.areasDisp.home_menu)    {return Promise.resolve(true)}

        this._state.areasDisp.home_menu = true;

        return this._home_menu.inject(dom_node);
    }

    ejectHomeMenu() {
        if (!this._state.areasDisp.home_menu) {return Promise.resolve(true)}

        this._state.areasDisp.home_menu = false;

        return this._home_menu.eject();
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

    showAlertReconnect() {
        this._alertifier.alertInput('reconnect', true)
            .then(confirmed => {
                this.emitEvent("reconnect", confirmed);
            });
    }

    hideAllAlerts() {
        this._alertifier.closeAll();
    }

    switchMenu(on) {
        this._lesson_pane.switchMenu(on);
    }

    switchDeveloperMode(on) {
        this._lesson_pane.switchTask(on);
    }

    switchTestMode(on) {
        this._launch_btn.switchPaneVisibility('test', on);
    }

    clickCalcButton(step=null) {
        step = step ? step : this._launch_btn.getCalcInput();

        this.emitEvent('calc', step);
    }

    displayCourses(courses) {
        this._home_menu.displayCourses(courses);
    }

    emphasize(on) {
        this._lesson_pane.emphasize(on);
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

    _checkURLHashCommand() {
        let hash = window.location.hash;

        return this._url_hash_parser.parse(hash);
    }

    _setMenuStructure() {
        this._lesson_pane.setMenuStructure([
            {
                type: 'default',
                name: "lessons",
                text: "Уроки",
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
        /* Как только нажата кнопка запуса миссии */
        this._lesson_pane.onMissionClick(idx => {
            this.emitEvent("mission", idx);
        });

        this._lesson_pane.onMenuClick(() => {
            this.emitEvent("menu");
        });

        this._home_menu.onLessonClick((lesson) => {
            this.emitEvent("lesson", lesson);
        });

        /* Как только нажата кнопка запуска/проверки */
        this._launch_btn.onButtonClick((button, start, data) => {
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

            if (button === 'chexec') {
                if (start) {
                    this.emitEvent("run", true);
                }
                else {
                    this.emitEvent("stop", true);
                }
            }

            if (button === 'calc') {
                if (start) {
                    this.emitEvent("calc", data);
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