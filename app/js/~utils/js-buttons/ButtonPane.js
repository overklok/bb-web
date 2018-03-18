const CLASS_NAMES = {
    MAIN: "jsbtn",
    KEY: "key",
    FADE_IN: "bounceIn",
    FADE_OUT: "fadeOutLeft",
    HIGHLIGHTED: "highlighted"
};

class ButtonPane {
    constructor(options) {
        if (!options) {throw new TypeError("Some config should be provided for launch")}

        this._button     = options.container;
        this._amount_max    = 30;

        this._style        = undefined;
        this._selectors         = {};
        this._list = undefined;
        this._buttons = [];

        this._launch();
        this.resize();
    }

    addButton(char='', highlighted=false) {
        this._checkButtonCount(true);

        let button = this._addButtonNode(char, highlighted);
        this._buttons.push(button);
    }

    clear() {
        while (Object.keys(this._buttons).length > 0) {
            let victim = this._buttons.shift();
            victim.classList.add(CLASS_NAMES.FADE_OUT);

            setTimeout(() => {
              this._removeButtonNode(victim);
            }, 100);
        }
    }

    resize() {
        let w = this._button.parentNode.offsetWidth;
        let h = this._button.parentNode.offsetHeight;
        let px = parseInt(getStyle(this._button.parentNode, "padding-left").slice(0, -2));
        let py = parseInt(getStyle(this._button.parentNode, "padding-top").slice(0, -2));
        let mx = 5;
        let my = 5;

        // let amount_vert = Math.floor(this._calcAmountVert(w, h, px, py, mx, my));
        // let node_size   = this._calcNodeSize(amount_vert, w, h, px, py, mx, my);

        // node_size = Math.floor(node_size);

        // this._amount_total = Math.floor(amount_vert) * this._amount_max_w;

        // if (this._amount_total > this._amount_max) {
        //     this._amount_total = this._amount_max;
        // }

        let s = h - py * 2 - 1;

        this._amount_max = Math.floor((w - px * 2) / (s + mx));


        if ((s + py * 2) === h) {
            s -=1;
        }

        s -= 1;

        this._checkButtonCount();

        this._updateStyles([
            {
                key: "." + CLASS_NAMES.KEY,
                props: [
                    {name: "width", value: s + "px"},
                    {name: "height", value: s + "px"},
                    {name: "font-size", value: s - 8 + "px"}
                ]
            },
            {
                key: "#qwerty li a span",
                props: [
                     {name: "line-height", value: h - px * 2 + "px"}
                ]
            }
        ]);
    }

    dispose() {
        if (this._button) {
            let parent = this._button.parentNode;
            parent.removeChild(this._button);
        }
    }

    _launch() {
        this._button.classList.add(CLASS_NAMES.MAIN);

        this._list = document.createElement("ul");
        this._list.id = "qwerty";

        this._button.appendChild(this._list);
    }

    /**
     * @param preventive
     */
    _checkButtonCount(preventive=false) {
        let extra = preventive ? 1 : 0;

        while (this._buttons.length + extra > this._amount_max) {
            let victim = this._buttons.shift();
            victim.classList.add(CLASS_NAMES.FADE_OUT);

            setTimeout(() => {
              this._removeButtonNode(victim);
            }, 100);
        }
    }

    _addButtonNode(code, emphasis) {
        let item        = document.createElement("li");
        let button_a    = document.createElement("a");
        let button_span = document.createElement("span");

        button_span.innerHTML = code;
        button_a.classList.add("key");

        button_a.appendChild(button_span);
        item.appendChild(button_a);

        item.classList.add(CLASS_NAMES.FADE_IN);

        if (emphasis) {
            button_a.classList.add(CLASS_NAMES.HIGHLIGHTED);
        }

        this._list.appendChild(item);

        return item;
    }

    _removeButtonNode(node) {
        this._list.removeChild(node);
    }

    _updateStyles(selectors) {
        if (this._style) {
            this._style.parentNode.removeChild(this._style);
        }

        this._style = document.createElement('style');
        document.head.appendChild(this._style);

        for (let selector of selectors) {

            let rule = "{";

            for (let prop of selector.props) {
                rule += prop.name + ": " + prop.value + ";";
            }

            rule += "}";

            this._style.sheet.insertRule(selector.key + " " + rule);
        }
    }

    _calcAmountVert(width, height, padding_x, padding_y, margin_x, margin_y) {
        // let numerator   = height + padding_y * 2;
        // let denominator = ((width + padding_x * 2) / this._amount_max_w) + margin_y * 2- margin_x * 2;

        // let amount_h = numerator / denominator;

        return amount_h < 1 ? 1 : amount_h;
    }

    _calcNodeSize(amount_h, width, height, padding_x, padding_y, margin_x, margin_y) {
        // let size = ((width + padding_x * 2) / (this._amount_max_w+1)) - margin_x * 2;
        let size = height;

        // let height_real = height - (size * amount_h) - (padding_y * 2) - (amount_h * margin_y * 2);

        return size;
    }
}

/**
 * https://robertnyman.com/2006/04/24/get-the-rendered-style-of-an-element/
 *
 * @param oElm
 * @param strCssRule
 * @returns {string}
 */
function getStyle(oElm, strCssRule){
	let strValue = "";
	if(document.defaultView && document.defaultView.getComputedStyle){
		strValue = document.defaultView.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
	}
	else if(oElm.currentStyle){
		strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1){
			return p1.toUpperCase();
		});
		strValue = oElm.currentStyle[strCssRule];
	}
	return strValue;
}

export default ButtonPane;