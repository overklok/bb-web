import Module from "../core/Module";

class GUIModule extends Module {
    static get eventspace_name() {return "gui"}
    static get event_types() {return ["switch", "launch"]}

    constructor(settings) {
        super();

        this._state = {
            switched: true // debug only
        };

        this._subscribeToWrapperEvents();
    }

    _subscribeToWrapperEvents() {
        $("#switch-btn").click(() => {
            this._state.switched = !this._state.switched;
            this.emitEvent("switch", this._state.switched);

            this._debug.log('Switch clicked: ', this._state.switched);
        });

        $("#launch-btn").click(() => {
            this.emitEvent("launch");
        });
    }
}

export default GUIModule;