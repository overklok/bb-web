import Wrapper from "../core/Wrapper";

import thm from "../../css/text-pane.css";

const CLASSES = {
    TEXT_PANE: "text-pane"
};

export default class TextPaneWrapper extends Wrapper {
    constructor() {
        super();

        this._text = undefined;
        this._button = undefined;
    }

    setText(html) {
        this._text = html;

        if (this._button) {
            this._button.innerHTML = this._text;
        }
    }

    inject(dom_node) {
        if (!dom_node) {return Promise.resolve(false)}

        this._button = document.createElement('div');
        this._button.classList.add(CLASSES.TEXT_PANE);

        dom_node.appendChild(this._button);

        if (this._text) {
            this._button.innerHTML = this._text;
        }

        return Promise.resolve(true);
    }

    eject() {
        if (!this._button) {return false}

        this._button.remove();

        return Promise.resolve(true);
    }
}