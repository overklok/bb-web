import Dispatcher from "./core/Dispatcher";

import BreadboardModule      from "./modules/BreadboardModule";
import LocalServiceModule from "./modules/LocalServiceModule";

console.info('Loaded version', __VERSION__);

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

        this.version = __VERSION__;
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
        this._mode_admin = config.modeAdmin;
        this._passive = config.passive || false;
    }

    /**
     * Запустить приложение
     *
     * Инициализируются модули, выполняется подписка диспетчера на них
     */
    run() {
        this._initModules();
        this._subscribeToModules();

        this._dispatcher.always(['bb:*', 'ls:*']);
    }

    /**
     * Обновить данные приложения
     *
     * @param {Array<Object>} plates плашки
     * @param {Array<Object>} currents токи
     */
    setData(plates, currents) {
        if (plates) {
            this.bb.updatePlates(plates);
        }

        if (currents) {
            this.bb.updateCurrents(currents);
        }
    }

    /**
     * Получить данные приложения
     *
     * @param {Array<Object>} plates плашки
     */
    getData() {
        return this.bb.getPlates();
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
        this.bb = new BreadboardModule({modeAdmin: this._mode_admin}); // Breadboard
        this.ls = new LocalServiceModule({modeDummy:this._passive}); // Local ServiceProvider

        this.ls.launch();
    }

    /**
     * Подписать диспетчер на события модулей
     *
     * @private
     */
    _subscribeToModules() {
        this._dispatcher.subscribe(this.bb);
        this._dispatcher.subscribe(this.ls);
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

        /**
         * Изменены плашки
         */
        this._dispatcher.on('ls:plates', data => {
            this.bb.clearCurrents();
            this.bb.updatePlates(data);
        });

        /**
         * Изменены токи
         */
        this._dispatcher.on('ls:currents', data => {
            this.bb.updateCurrents(data);
        });

        /**
         * Обновлена доска
         */
        this._dispatcher.on('bb:change', data => {
            this.bb.clearCurrents();

            this.ls.sendPlates(this.bb.getPlates());

            this._on_change_callback(data);
        });
    }
}

window.AdminBoardApplication = AdminBoardApplication;
window.BOARD_VERSION = __VERSION__;

export default AdminBoardApplication;
