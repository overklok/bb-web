import Wrapper from "../core/Wrapper";

import {Timeline} from "vis-timeline";

export default class TimelineWrapper extends Wrapper {
    inject(dom_node) {
        if (!dom_node) {return Promise.resolve(false)}

        new Timeline(dom_node);
    }
}