import Dispatcher from "./core/Dispatcher";

import GUIModule            from "./modules/GUIModule";
import LayoutModule         from "./modules/LayoutModule";
import BreadboardModule     from "./modules/BreadboardModule";
import WorkspaceModule      from "./modules/WorkspaceModule";
import LocalServiceModule   from "./modules/LocalServiceModule";
import GlobalServiceModule  from "./modules/GlobalServiceModule";

class Application {
    constructor() {
//         alert('app constructor called');

        /// Диспетчер событий
        this._dispatcher = new Dispatcher();

        /// Модули
        this.gui    = new GUIModule();
        this.lay    = new LayoutModule();
        this.ws     = new WorkspaceModule();        // Blockly
        this.bb     = new BreadboardModule();       // макетная плата - графика
        this.ls     = new LocalServiceModule();     // макетная плата - electron
        this.gs     = new GlobalServiceModule();    // веб-сервер

        this._dispatcher.subscribe(this.gui);
        this._dispatcher.subscribe(this.lay);
        this._dispatcher.subscribe(this.ls);
        this._dispatcher.subscribe(this.gs);

        this._dispatcher.only(['ls:connect']);
        this._dispatcher.always(['*:error', 'lay:*', 'ls:disconnect']);

        this._defineChains();
      }

    _defineChains() {
        /**
         * Когда плата готова к работе
         */
        this._dispatcher.on('ls:connect', () => {
            /// Запросить ссылки для прошивки
            this.gs.getUpgradeURLS()
                /// Обновить прошивку
                .then(urls  => this.ls.upgrade(urls))
                /// Разрешить обрабатывать события платы и GUI
                .then(()    => this._dispatcher.only(['ls:*', 'gui:*']))
                /// Обработать ошибки
                .catch(err  => {throw err})
        });

        /**
         * Когда разметка скомпонована
         */
        this._dispatcher.on('lay:compose', (data) => {
            this.ws.inject(data.editor);
            this.bb.inject(data.board);

            /// Прослушивать все события GUI
            this._dispatcher.only(['gui:*']);
        });

        /**
         * Когда размер разметки изменён
         */
        this._dispatcher.on('lay:resize', () => {
            this.ws.resize();
        });

        /**
         * Когда нажата кнопка переключения разметки
         */
        this._dispatcher.on('gui:switch', (on) => {
            this._dispatcher.taboo();

            this.ws.takeout();
            this.bb.takeout();


            if (on === true) {
                this.lay.compose(0x00);
            }

            if (on === false) {
                this.lay.compose(0xFF);
            }
        });

        this._dispatcher.on('ls:error', (err) => {
            console.error('[LSERR]', err);
        });

        this._dispatcher.on('gs:error', (err) => {
            console.error('[GSERR]', err);
        });
    }
}

window.Application = Application;

export default Application;
