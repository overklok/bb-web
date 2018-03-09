import Dispatcher from "./core/Dispatcher";

import BreadboardModule      from "./modules/BreadboardModule";

class Application {
    constructor() {
        /// Диспетчер событий
        this._dispatcher = new Dispatcher();
        /// Конфигурация
        this._config = {};

        this._defineChains();
    }

    /**
     * Преобразовать пользовательскую конфигурацию в настройки модулей
     *
     * Конфигурация, удобная для пользователя, преобразуется
     * в конфигурацию, требуемую в отдельных модулях
     *
     * @param config пользовательская конфигурация
     */
    configure(config) {
        if (!config) {return true}

        this._container_id = config.containerId || "";
    }

    /**
     * Запустить приложение
     *
     * Инициализируются модули, производится
     */
    run() {
        this._initModules();
        this._subscribeToModules();

        this._dispatcher.always(['bb:*']);
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
        this.bb = new BreadboardModule({modeAdmin: true}); // Breadboard
    }

    _subscribeToModules() {
        this._dispatcher.subscribe(this.bb);
    }

    _defineChains() {
        $(document).ready(() => {
            this.bb.inject(document.getElementById(this._container_id));

            this.bb.updatePlates([
                {type: 'resistor',  x: 4, y: 4, orientation: 'north', id: null, number: 200},
                {type: 'resistor',  x: 2, y: 2, orientation: 'north', id: null, number: 200},
                {type: 'bridge',    x: 0, y: 0, orientation: 'north', id: null, number: 5},
                {type: 'capacitor', x: 0, y: 0, orientation: 'north', id: null},
                {type: 'strip',     x: 0, y: 7, orientation: 'west', id: null, number: 4},
            ]);

            this.bb.updatePlateState(-1, {highlighted: true});
        });
    }
}

window.Application = Application;

export default Application;
