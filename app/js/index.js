import Dispatcher from "./core/Dispatcher";
import WorkspaceModule from "./modules/WorkspaceModule";

class Application {
    constructor() {
        alert('app constructor called');

        /// Диспетчер событий
        this._dispatcher = new Dispatcher();

        /// Модули
        this.ws = new WorkspaceModule();    // рабочая область
    }


}

window.Application = Application;

export default Application;