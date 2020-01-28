import Module from "../core/Module";

import TimelineWrapper from "../wrappers/TimelineWrapper";

export default class TimelineModule extends Module {
    static get eventspace_name()    {return "tl"}
    static get event_types()        {return []}

    constructor(options) {
        super(options);

        this._timeline = new TimelineWrapper();
    }

    inject(dom_node, read_only=true) {
        if (!dom_node) {
            throw new TypeError("DOM Node must be defined");
        }

        this._timeline.inject(dom_node, {
            readOnly: read_only
        });
    }
}