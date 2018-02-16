import Module from "../core/Module";

import FileWrapper from '../wrappers/FileWrapper';

class GUIModule extends Module {
    static get eventspace_name() {return "gui"}
    static get event_types() {return ["switch", "check", "launch", "stop", "keyup", "load-tree", "unload-tree"]}

    static defaults() {
        return {
            anyKey: false,
        }
    }

    constructor(options) {
        super(options);

        this._filer = new FileWrapper();

        this._button_codes = {};

        this._state = {
            switched: true // debug only
        };

        this._subscribeToWrapperEvents();
    }

    setButtonCodes(button_codes) {
        if (!Array.isArray(button_codes)) {
            throw new TypeError("setButtonCodes(): button codes should be an Array instance");
        }

        this._button_codes = button_codes;
    }

    saveToFile(str) {
        this._filer.saveStrToFile("codehour-sample-code.txt", str);
    }

    loadFromFile(files) {
        this._filer.readStrFromFile(files[0])
            .then(str => this.emitEvent("load-tree", str));
    }

    _filterKeyEvent(keycode) {
        if (keycode in this._button_codes || this._options.anyKey) {
            return keycode;
        }

        return false;
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

        $("#stop-btn").click(() => {
            this.emitEvent("stop");
        });

        $(" #load-btn").change((evt) => {
            this.loadFromFile(evt.target.files);
        });

        $("#unload-btn").click(() => {
            this.emitEvent("unload-tree");
        });

        $(document).keyup(event => {
            if (this._filterKeyEvent(event.which)) {
                this.emitEvent("keyup", event.which);
            }
        });
    }
}

export default GUIModule;