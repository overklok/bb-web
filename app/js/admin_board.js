import Dispatcher from "./core/Dispatcher";

import BreadboardModule      from "./modules/BreadboardModule";

/**
 * Модуль "Редактор платы" административного интерфейса web-приложения "Макетная плата"
 *
 * Задаёт взаимосвязи между событиями и функциями модулей.
 * Запускается в браузере администратора приложения.
 */
class AdminBoardApplication {
    /**
     * Создать экземпляр приложения
     */
    constructor() {
        /** @type {Dispatcher} диспетчер событий */
        this._dispatcher = new Dispatcher();

        /** @type {Object} общая конфигурация */
        this._config = {};

        /** @type {function} Обработчик события `изменены данные` */
        this._on_change_callback = function() {};

        this._defineChains();
    }

    /**
     * Преобразовать пользовательскую конфигурацию в настройки модулей
     *
     * Конфигурация, удобная для пользователя, преобразуется
     * в конфигурацию, требуемую в отдельных модулях
     *
     * @param {Object} config пользовательская конфигурация
     */
    configure(config) {
        if (!config) {return true}

        this._container_id = config.containerId || "";
    }

    /**
     * Запустить приложение
     *
     * Инициализируются модули, выполняется подписка диспетчера на них
     */
    run() {
        this._initModules();
        this._subscribeToModules();

        this._dispatcher.always(['bb:*']);
    }

    /**
     * Обновить данные приложения
     *
     * @param {Array<Object>} plates плашки
     * @param {Array<Object>} currents токи
     */
    setData(plates, currents) {
        this.bb.updatePlates(plates);
        // this.bb.updateCurrents(currents);
    }

    /**
     * Получить данные приложения
     *
     * @param {Array<Object>} plates плашки
     */
    getData() {
        return this.bb.getData();
    }

    /**
     * Задать обработчик события `изменены данные`
     *
     * @param {function} callback обработчик события `изменены данные`
     */
    onChange(callback) {
        this._on_change_callback = callback;
    }

    /**
     * Инициализировать модули
     *
     * Используется заданная ранее конфигурация модулей
     *
     * @private
     */
    _initModules() {
        /// Модули

        /** @type {BreadboardModule} модуль отображения макетной платы */
        this.bb = new BreadboardModule({modeAdmin: true}); // Breadboard
    }

    /**
     * Подписать диспетчер на события модулей
     *
     * @private
     */
    _subscribeToModules() {
        this._dispatcher.subscribe(this.bb);
    }

    /**
     * Определить цепочки-обработчики
     *
     * @private
     */
    _defineChains() {
        $(document).ready(() => {
            this.bb.inject(document.getElementById(this._container_id));
        });

        this._dispatcher.on("bb:change", data => {
            this._on_change_callback(data);
        })
    }
}

window.AdminBoardApplication = AdminBoardApplication;

export default AdminBoardApplication;
