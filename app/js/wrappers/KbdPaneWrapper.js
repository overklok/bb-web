import Wrapper from "../core/Wrapper";
import ButtonPane from "../~utils/js-buttons/ButtonPane";

import styles from "../~utils/js-buttons/themes/default/css/main.css";

const BUTTON_CHARS = {
    48: '0', 81: 'Q', 65: 'A', 38: '↑',
    49: '1', 87: 'W', 83: 'S', 40: '↓',
    50: '2', 69: 'E', 68: 'D', 37: '←',
    51: '3', 82: 'R', 70: 'F', 39: '→',
    52: '4', 84: 'T', 71: 'G',
    53: '5', 89: 'Y', 72: 'H',
    54: '6',
    55: '7',
    56: '8',
    57: '9',
};

class KbdPaneWrapper extends Wrapper {
    constructor() {
        super();

        this._cont = undefined;
        this._pane = undefined;
    }

    include(pane_container) {
        if (this._pane) {return true}

        let cont = document.createElement("div");
        pane_container.appendChild(cont);

        this._pane = new ButtonPane({
            container: cont
        });
    }

    exclude() {
        if (!this._pane) {return true}

        this._pane.dispose();

        if (this._cont) {
            this._cont.parentNode.removeChild(this._cont);
            this._cont = null;
        }

        this._pane = null;
    }

    addButton(code, highlight) {
        let char = BUTTON_CHARS[code];

        this._pane.addButton(char, highlight);
    }

    clear() {
        this._pane.clear();
    }

    _onResize() {
        this._pane.resize();
    }
}

export default KbdPaneWrapper;