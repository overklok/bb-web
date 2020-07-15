import Layer from "../core/Layer";

import "../styles/selector.css";

export default class SelectorLayer extends Layer {
    constructor(container, grid) {
        super(container, grid);

        this._maincontainer = undefined;

        this._backgroundgroup = undefined;
        this._scrollbargroup = undefined;

        this._itemcount = 0;

        this._initGroups();
    }

    compose() {
        this._backgroundgroup
            .rect('100%', '99%') /// 99 из-за обрезания рамки
            .radius(20)
            .fill({color: "#f9f9f9"})
            .stroke({color: "#c9c9c9", width: 4})
            .move(4, 4);

        const bg = this._maincontainer
            .rect('100%', '90%')
            .radius(20)
            .fill({color: "#f9f9f9"})
            .stroke({color: "#c9c9c9", width: 4});

        this._maincontainer.x(4).y('10%');

        this._htmlcontainer = this._getEmbeddedHtmlGroup(this._maincontainer, '100%', '100%')

        this._appendScrollables();

        this._appendItem();
        this._appendItem();
        this._appendItem();
    }

    _appendScrollables() {
        this._htmlcontainer.classList.add('bb-sel-root');

        this._area = document.createElement("div");
        this._area.classList.add('bb-sel-list');

        this._htmlcontainer.appendChild(this._area);
    }

    _appendItem() {
        const item = document.createElement("div");
        const cell = document.createElement("div");
        const slider = document.createElement("div");
        const slide_left = document.createElement("div");
        const slide_right = document.createElement("div");
        const pedestal = document.createElement("div");
        const bulletlist = document.createElement("ul");
        const bullets = [
            document.createElement("li"),
            document.createElement("li"),
            document.createElement("li"),
        ]

        item.classList.add('bb-sel-item');
        cell.classList.add('bb-sel-cell');
        slider.classList.add('bb-sel-slider');
        pedestal.classList.add('bb-sel-pedestal');
        bulletlist.classList.add('bb-sel-bulletlist');
        slide_left.classList.add('bb-sel-slide', 'bb-sel-slide-left');
        slide_right.classList.add('bb-sel-slide', 'bb-sel-slide-right');

        bullets[0].classList.add('bb-sel-bullet');
        bullets[1].classList.add('bb-sel-bullet');
        bullets[2].classList.add('bb-sel-bullet');

        bulletlist.appendChild(bullets[0]);
        bulletlist.appendChild(bullets[1]);
        bulletlist.appendChild(bullets[2]);

        pedestal.appendChild(bulletlist);

        cell.appendChild(slide_left);
        cell.appendChild(slide_right);
        cell.appendChild(pedestal);
        cell.appendChild(slider);
        item.appendChild(cell);
        this._area.appendChild(item);

        slider.innerHTML = "TEST";

        slide_right.innerText = ">";
        slide_left.innerText = "<";

        this._itemcount++;
    }

    _initGroups() {
        this._clearGroups();

        this._backgroundgroup   = this._container.group();
        this._maincontainer     = this._container.nested();
    }

    _clearGroups() {
        if (this._backgroundgroup)  this._backgroundgroup.remove();
        if (this._maincontainer)    this._maincontainer.remove();
    }

    _getEmbeddedHtmlGroup(container, width=0, height=0, x=0, y=0) {
        let fo = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");

        fo.classList.add("node");
        fo.setAttribute("width", width);
        fo.setAttribute("height", height);
        fo.setAttribute("x", x);
        fo.setAttribute("y", y);

        container.node.appendChild(fo);

        let body = document.createElement("div");
        body.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");

        fo.appendChild(body);

        return body;
    }
}