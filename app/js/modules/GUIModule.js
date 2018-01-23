import Module from "../core/Module";

class GUIModule extends Module {
    static get eventspace_name() {return "gui"}
    static get event_types() {return ["switch"]}

    constructor(settings) {
        super();

        this._state = {
            switched: true // debug only
        };

        this._subscribeToWrapperEvents();
    }

    _subscribeToWrapperEvents() {
        let self = this;

        $("#switch-btn").click(function() {
            self._state = !self._state;
            self.emitEvent("switch", self._state);
        });
    }
}

export default GUIModule;