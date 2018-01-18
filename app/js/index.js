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

        /// Модули
        // this.ls = new LocalServiceModule();    //
        this.bb = new BreadboardModule();      // макетная плата

        // this._dispatcher.subscribe(this.ls);

        this._defineChains();
      }

    _defineChains() {
        this._dispatcher.on('ls:connect', function () {
           console.log('Connected');
        });
    }
}

window.Application = Application;

export default Application;
