import Dispatcher from "./core/Dispatcher";

import TimelineModule from "./modules/TimelineModule";

console.info('Loaded version', __VERSION__);

class Timeline {
    /**
     * Создать экземпляр приложения
     */
    constructor() {
        /** @type {Dispatcher} диспетчер событий */
        this._dispatcher = new Dispatcher();

        /** @type {Object} общая конфигурация */
        this._config = {};

        this._defineChains();

        this.version = __VERSION__;
    }

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

        this._dispatcher.always(['tl:*']);
    }

    /**
     * Обновить данные приложения
     */
    setData() {

    }

    /**
     * Получить данные приложения
     */
    getData() {
        return null;
    }

    /**
     * Инициализировать модули
     *
     * @private
     */
    _initModules() {
        /// Модули

        this.tl = new TimelineModule();
    }

    /**
     * Подписать диспетчер на события модулей
     *
     * @private
     */
    _subscribeToModules() {
        this._dispatcher.subscribe(this.tl);
    }

    /**
     * Определить цепочки-обработчики
     *
     * @private
     */
    _defineChains() {
        $(document).ready();
    }
}

window.Timeline = Timeline;
window.TIMELINE_VERSION = __VERSION__;

export default Timeline;
