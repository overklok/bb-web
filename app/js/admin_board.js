import Dispatcher from "./core/Dispatcher";

import BreadboardModule      from "./modules/BreadboardModule";

class AdminBoardApplication {
    constructor() {
        /// Диспетчер событий
        this._dispatcher = new Dispatcher();
        /// Конфигурация
        this._config = {};

        this._on_change_callback = function() {};

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

    setData(plates, currents) {
        this.bb.updatePlates(plates);
        this.bb.updateCurrents(currents);
    }

    getData() {
        return this.bb.getData();
    }

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
        this.bb = new BreadboardModule({modeAdmin: true}); // Breadboard
    }

    _subscribeToModules() {
        this._dispatcher.subscribe(this.bb);
    }

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
