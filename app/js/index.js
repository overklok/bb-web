import Dispatcher from "./core/Dispatcher";

import BreadboardModule from "./modules/BreadboardModule";
import WorkspaceModule from "./modules/WorkspaceModule";
import LocalServiceModule from "./modules/LocalServiceModule";

import $ from 'jquery';

class Application {
    constructor() {
        alert('app constructor called');

        /// Диспетчер событий
        this._dispatcher = new Dispatcher();

        $(document).ready(function () {
           /// Модули
            this.ls = new LocalServiceModule();    // рабочая область
            this.bb = new BreadboardModule();      // макетная плата

        this._dispatcher.subscribe(this.ls);

        this.defineChains();

        });
    }

    defineChains() {
        this._dispatcher.on('ls:connect', function () {
           console.log('Connected');
        });
    }
}

window.Application = Application;

export default Application;