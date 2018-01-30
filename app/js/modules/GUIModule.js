import Module from "../core/Module";

class GUIModule extends Module {
    static get eventspace_name() {return "gui"}
    static get event_types() {return ["switch", "upgrade"]}

    constructor(settings) {
        super();

        this._state = {
            switched: true // debug only
        };

        this._subscribeToWrapperEvents();

        this._debug.log("GUI Module was constructed");
    }

    _subscribeToWrapperEvents() {
        $("#switch-btn").click(() => {
            this._state.switched = !this._state.switched;
            this.emitEvent("switch", this._state.switched);

            this._debug.log('Switch clicked: ', this._state.switched);
        });

        $("#upgrade-btn").click(() => {
            this.emitEvent("upgrade");
        })
    }
}

export default GUIModule;