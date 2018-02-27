import Wrapper from "../core/Wrapper";

import thm from "../../css/text-pane.css";

const CLASSES = {
    TEXT_PANE: "text-pane"
};

class TextPaneWrapper extends Wrapper {
    constructor() {
        super();

        this._text = undefined;
        this._container = undefined;
    }

    setText(html) {
        this._text = html;

        if (this._container) {
            this._container.innerHTML = this._text;
        }
    }

    inject(dom_node) {
        if (!dom_node) {return Promise.resolve(false)}

        this._container = document.createElement('div');
        this._container.classList.add(CLASSES.TEXT_PANE);

        dom_node.appendChild(this._container);

        if (this._text) {
            this._container.innerHTML = this._text;
        }

        return Promise.resolve(true);
    }

    eject() {
        if (!this._container) {return false}

        this._container.remove();

        return Promise.resolve(true);
    }
}

export default TextPaneWrapper;