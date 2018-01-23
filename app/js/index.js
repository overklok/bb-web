import Dispatcher from "./core/Dispatcher";

import GUIModule            from "./modules/GUIModule";
import LayoutModule         from "./modules/LayoutModule";
import BreadboardModule     from "./modules/BreadboardModule";
import WorkspaceModule      from "./modules/WorkspaceModule";
import LocalServiceModule   from "./modules/LocalServiceModule";

class Application {
    constructor() {
//         alert('app constructor called');

        /// Диспетчер событий
        this._dispatcher = new Dispatcher();

        /// Модули
        this.gui    = new GUIModule();
        this.lay    = new LayoutModule();
        this.ws     = new WorkspaceModule();       // Blockly
        this.bb     = new BreadboardModule();      // макетная плата
        // this.ls = new LocalServiceModule();     //
// 
        // this._dispatcher.subscribe(this.ls);
        this._dispatcher.subscribe(this.gui);
        this._dispatcher.subscribe(this.lay);


        this._defineChains();

        this._dispatcher.only(['gui:*']);
        this._dispatcher.always(['lay:*']);
      }

    _defineChains() {
        let self = this;

        this._dispatcher.on('ls:connect', function () {
           console.log('Connected');
        });

        this._dispatcher.on('lay:compose', function(data) {
            console.log('Layout composed: ', data);
            self.ws.inject(data.editor);
            self.bb.inject(data.board);
        });

        this._dispatcher.on('lay:resize', function(data) {
            self.ws.resize();
        });

        this._dispatcher.on('gui:switch', function(on) {
            console.log('Switch clicked: ', on);

            self.ws.takeout();
            self.bb.takeout();


            if (on === true) {
                self.lay.compose(0x00);
            }

            if (on === false) {
                self.lay.compose(0xFF);
            }
        });
    }
}

window.Application = Application;

export default Application;
