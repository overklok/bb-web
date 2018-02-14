import Module from "../core/Module";

import FileWrapper from '../wrappers/FileWrapper';

class GUIModule extends Module {
    static get eventspace_name() {return "gui"}
    static get event_types() {return ["switch", "check", "launch", "load-tree", "unload-tree"]}

    constructor(options) {
        super(options);

        this._filer = new FileWrapper();

        this._state = {
            switched: true // debug only
        };

        this._subscribeToWrapperEvents();
    }

    saveToFile(str) {
        this._filer.saveStrToFile("codehour-sample-code.txt", str);
    }

    loadFromFile(files) {
        this._filer.readStrFromFile(files[0])
            .then(str => this.emitEvent("load-tree", str));
    }

    _subscribeToWrapperEvents() {
        $("#switch-btn").click(() => {
            this._state.switched = !this._state.switched;
            this.emitEvent("switch", this._state.switched);

            this._debug.log('Switch clicked: ', this._state.switched);
        });

        $("#check-btn").click(() => {
            this.emitEvent("check");
        });

        $("#launch-btn").click(() => {
            this.emitEvent("launch");
        });

        $(" #load-btn").change((evt) => {
            this.loadFromFile(evt.target.files);
        });

        $("#unload-btn").click(() => {
            this.emitEvent("unload-tree");
        })
    }
}

export default GUIModule;