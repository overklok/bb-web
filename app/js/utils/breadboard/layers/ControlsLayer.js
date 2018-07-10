import Layer from "../core/Layer";

export default class ControlsLayer extends Layer {
    static get Class() {return "bb-layer-controls"}

    constructor(container, grid) {
        super(container, grid);

        this._container.addClass(ControlsLayer.Class);

        this._params = {
            x1: 100,
            x2: 800,
            y: 0,
        };

        this._addgroup      = undefined;
        this._cleargroup    = undefined;

        this._callbacks = {
            add: () => {},
            clear: () => {},
            fullscreen: () => {},
        };

        this._is_fullscreen = false;
        this._is_visible = false;
    }

    compose(plate_types, plate_captions) {
        this._drawLeftMenu(plate_types, plate_captions);
        this._drawRightMenu();
        this._hide();
    }

    switchVisibility() {
        this._is_visible ? this._hide() : this._show();

        this._is_visible = !this._is_visible;
    }

    _show() {
        this._addgroup.style.display = "block";
        this._cleargroup.style.display = "block";
    }

    _hide() {
        this._addgroup.style.display = "none";
        this._cleargroup.style.display = "none";
    }

    onAdd(cb) {
        if (!cb) {
            this._callbacks.add = () => {};
        } else {
            this._callbacks.add = cb;
        }
    }

    onClear(cb) {
        if (!cb) {
            this._callbacks.clear = () => {};
        } else {
            this._callbacks.clear = cb;
        }
    }

    onFullscreen(cb) {
        if (!cb) {
            this._callbacks.fullscreen = () => {};
        } else {
            this._callbacks.fullscreen = cb;
        }
    }

    _drawLeftMenu(plate_types, plate_captions) {
        this._addgroup = this._getEmbeddedHtmlGroup(270, 200, this._params.x1, this._params.y);

        let wrap = document.createElement("div");
        let input = document.createElement("input");
        let select = document.createElement("select");
        let btn_apply = document.createElement("a");

        wrap.classList += "bb-plate-left-wrap";
        input.classList += "bb-plate-add-input";
        select.classList += "bb-plate-add-selector";
        btn_apply.classList += "bb-plate-btn-add";

        let options = plate_types;

        for (let i = 0; i < options.length; i++) {
            let opt = options[i];
            let el = document.createElement("option");
            el.textContent = plate_captions[opt];
            el.value = opt;

            select.appendChild(el);
        }

        btn_apply.addEventListener("click", () => {
            let plate_type = select.options[select.selectedIndex].value;
            let extra = input.value;

            this._callbacks.add(plate_type, extra);
        });

        btn_apply.innerHTML = "Добавить";

        wrap.appendChild(select);
        wrap.appendChild(input);
        wrap.appendChild(btn_apply);

        this._addgroup.appendChild(wrap);
    }

    _drawRightMenu() {
        this._cleargroup = this._getEmbeddedHtmlGroup(300, 200, this._params.x2, this._params.y);

        let wrap = document.createElement("div");
        let btn_clear = document.createElement("a");
        let btn_fullscreen = document.createElement("a");

        wrap.classList += "bb-plate-right-wrap";
        btn_clear.classList += "bb-plate-btn-clear";
        btn_fullscreen.classList += "bb-plate-btn-fullscreen";

        btn_clear.addEventListener("click", () => {
            this._callbacks.clear();
        });

        btn_fullscreen.addEventListener("click", () => {
            this._is_fullscreen = !this._is_fullscreen;
            this._callbacks.fullscreen(this._is_fullscreen);

            btn_fullscreen.innerHTML = this._is_fullscreen ? "Свернуть" : "Во весь экран";
        });

        btn_clear.innerHTML = "Очистить всё";
        btn_fullscreen.innerHTML = "Во весь экран";

        wrap.appendChild(btn_clear);
        wrap.appendChild(btn_fullscreen);
        this._cleargroup.appendChild(wrap);
    }

    _getEmbeddedHtmlGroup(width=0, height=0, x=0, y=0) {
        let fo = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");

        fo.classList.add("node");
        fo.setAttribute("width", width);
        fo.setAttribute("height", height);
        fo.setAttribute("x", x);
        fo.setAttribute("y", y);

        this._container.node.appendChild(fo);

        let body = document.createElement("div");
        body.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");

        fo.appendChild(body);

        return body;
    }
}