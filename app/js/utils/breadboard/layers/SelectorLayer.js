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
        const cell = document.createElement("div");
        const slidectrl_left = document.createElement("div");
        const slidectrl_right = document.createElement("div");
        const pedestal_wrap = document.createElement("div");
        const pedestal = document.createElement("ul");

        cell.classList.add('bb-sel-cell');
        pedestal_wrap.classList.add('bb-sel-pedestal-wrap');
        pedestal.classList.add('bb-sel-pedestal');
        slidectrl_left.classList.add('bb-sel-slidectrl', 'bb-sel-slidectrl-left');
        slidectrl_right.classList.add('bb-sel-slidectrl', 'bb-sel-slidectrl-right');

        const elements = [
            this._generateSlide(cell, pedestal),
            this._generateSlide(cell, pedestal),
            this._generateSlide(cell, pedestal),
        ];

        pedestal_wrap.appendChild(pedestal);

        cell.appendChild(slidectrl_left);
        cell.appendChild(slidectrl_right);
        cell.appendChild(pedestal_wrap);
        this._area.appendChild(cell);

        slidectrl_right.innerText = ">";
        slidectrl_left.innerText = "<";

        elements[0][1].click();

        slidectrl_right.addEventListener('click', () => {
            const bullet_active = pedestal.getElementsByClassName('active')[0];
            const idx_curr = this._getElementIndex(bullet_active);

            // negative modulo
            elements[(((idx_curr + 1) % 3) + 3) % 3][1].click();
        });

        slidectrl_left.addEventListener('click', () => {
            const bullet_active = pedestal.getElementsByClassName('active')[0];
            const idx_curr = this._getElementIndex(bullet_active);

            // negative modulo
            elements[(((idx_curr - 1) % 3) + 3) % 3][1].click();
        });

        this._itemcount++;
    }

    _generateSlide(cell, pedestal) {
        const slide = document.createElement("div");
        const bullet = document.createElement("li");

        slide.classList.add('bb-sel-slide');

        slide.innerText = "TEST";

        cell.appendChild(slide);
        pedestal.appendChild(bullet);

        bullet.addEventListener('click', () => {
            const slide_active  = cell.getElementsByClassName('active')[0];
            const bullet_active = pedestal.getElementsByClassName('active')[0];

            if (slide_active && bullet_active) {
                const idx_prev = this._getElementIndex(bullet_active);
                const idx_curr = this._getElementIndex(bullet);

                if (idx_prev === idx_curr) return;

                if (idx_prev > idx_curr) {
                    // Previous element positioned to the right
                    slide_active.animate({
                        left: ["50%", '100%']
                    }, 500);
                    slide.animate({
                        left: ["0%", '50%']
                    }, 500);
                } else {
                    // Previous element positioned to the left
                    slide_active.animate({
                        left: ["50%", '0%']
                    }, 500);
                    slide.animate({
                        left: ["100%", '50%']
                    }, 500);
                }

                slide_active.classList.remove('active');
                bullet_active.classList.remove('active');
            }

            slide.style.left = "50%";

            bullet.classList.add('active');
            slide.classList.add('active');
        });

        return [slide, bullet];
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

    _getElementIndex(node) {
        let index = 0;
        while ( (node = node.previousElementSibling) ) {index++;}
        return index;
    }
}