import SVG from 'svgjs';
import Layer from "../core/Layer";

import "../styles/selector.css";
import BridgePlate from "../plates/BridgePlate";
import SwitchPlate from "../plates/SwitchPlate";
import LEDPlate from "../plates/LEDPlate";
import ResistorPlate from "../plates/ResistorPlate";
import PhotoresistorPlate from "../plates/PhotoresistorPlate";
import RheostatPlate from "../plates/RheostatPlate";
import ButtonPlate from "../plates/ButtonPlate";
import TButtonPlate from "../plates/TButtonPlate";
import CapacitorPlate from "../plates/CapacitorPlate";
import DummyPlate from "../plates/DummyPlate";
import TransistorPlate from "../plates/TransistorPlate";
import InductorPlate from "../plates/InductorPlate";
import RelayPlate from "../plates/RelayPlate";
import BuzzerPlate from "../plates/BuzzerPlate";

const ITEMS = [
    {
        title: "Перемычка",
        type: BridgePlate,
        options: [
            {title: "2 клетки", extra: 2},
            {title: "3 клетки", extra: 3},
            {title: "4 клетки", extra: 4},
            {title: "5 клеток", extra: 5},
            {title: "6 клеток", extra: 6},
        ]
    },
    {
        title: "Светодиод",
        type: LEDPlate,
        options: [
            {title: "Зелёный", extra: "G"},
            {title: "Красный", extra: "R"}
        ]
    },
    {
        title: "Резистор",
        type: ResistorPlate,
        options: [
            {title: "200 Ом",   extra: 200},
            {title: "1  кОм",   extra: 1000},
            {title: "10 кОм",   extra: 10000}
        ]
    },
    {
        title: "Конденсатор",
        type: CapacitorPlate,
        options: [{title: "Обычный"}]
    },

    {title: "Транзистор",   type: TransistorPlate,      options: [{title: "Обычный"}]},
    {title: "Фоторезистор", type: PhotoresistorPlate,   options: [{title: "Обычный"}]},
    {title: "Реостат",      type: RheostatPlate,        options: [{title: "Обычный"}]},
    {title: "Кнопка",       type: ButtonPlate,          options: [{title: "Обычная"}]},
    {title: "Кнопка-3",     type: TButtonPlate,         options: [{title: "Обычная"}]},
    {title: "Ключ",         type: SwitchPlate,          options: [{title: "Обычный"}]},
    {title: "Индуктор",     type: InductorPlate,        options: [{title: "Обычный"}]},
    {title: "Реле",         type: RelayPlate,           options: [{title: "Обычное"}]},
    {title: "Зуммер",       type: BuzzerPlate,          options: [{title: "Обычный"}]},
    {title: "Dummy",        type: DummyPlate,           options: [{title: "Обычная"}]},

]

export default class SelectorLayer extends Layer {
    constructor(container, grid) {
        super(container, grid);

        this._maincontainer = undefined;

        this._backgroundgroup = undefined;

        this._itemcount = 0;

        this._initGroups();
    }

    compose() {
        this._backgroundgroup
            .rect('30%', '99%') /// 99 из-за обрезания рамки
            .radius(20)
            .fill({color: "#f9f9f9"})
            .stroke({color: "#c9c9c9", width: 4})
            .move(4, 4);

        this._maincontainer
            .rect('30%', '89%')
            .radius(20)
            .fill({color: "#f9f9f9"})
            .stroke({color: "#c9c9c9", width: 4});

        this._maincontainer.x(4).y('10%');

        this._htmlcontainer = this._getEmbeddedHtmlGroup(this._maincontainer, '30%', '88%')

        this._appendScrollables();

        for (const item of ITEMS) {
            this._appendItem(item);
        }
    }

    _appendScrollables() {
        this._area = document.createElement("div");
        this._area.classList.add('bb-sel-list');

        this._htmlcontainer.appendChild(this._area);
    }

    _appendItem(settings) {
        if (!settings.options) return;

        const cell = document.createElement("div");
        const slidectrl_left = document.createElement("div");
        const slidectrl_right = document.createElement("div");
        const pedestal_wrap = document.createElement("div");
        const pedestal = document.createElement("ul");
        const title = document.createElement("div");
        const subtitle = document.createElement("div");

        cell.classList.add('bb-sel-cell');
        pedestal_wrap.classList.add('bb-sel-pedestal-wrap');
        pedestal.classList.add('bb-sel-pedestal');
        slidectrl_left.classList.add('bb-sel-slidectrl', 'bb-sel-slidectrl-left');
        slidectrl_right.classList.add('bb-sel-slidectrl', 'bb-sel-slidectrl-right');
        title.classList.add('bb-sel-title');
        subtitle.classList.add('bb-sel-subtitle');

        const elements = [];

        for (const option of settings.options) {
            elements.push(
                this._generateSlide(cell, pedestal, subtitle, settings, option)
            )
        }

        pedestal_wrap.appendChild(subtitle);
        pedestal_wrap.appendChild(pedestal);

        cell.appendChild(title);
        cell.appendChild(slidectrl_left);
        cell.appendChild(slidectrl_right);
        cell.appendChild(pedestal_wrap);
        this._area.appendChild(cell);

        title.innerText = settings.title;

        slidectrl_right.innerText = ">";
        slidectrl_left.innerText = "<";

        elements[0][1].click();

        const ellen = elements.length;

        slidectrl_right.addEventListener('click', () => {
            const bullet_active = pedestal.getElementsByClassName('active')[0];
            const idx_curr = this._getElementIndex(bullet_active);

            // negative modulo
            elements[(((idx_curr + 1) % ellen) + ellen) % ellen][1].click();
        });

        slidectrl_left.addEventListener('click', () => {
            const bullet_active = pedestal.getElementsByClassName('active')[0];
            const idx_curr = this._getElementIndex(bullet_active);

            // negative modulo
            elements[(((idx_curr - 1) % ellen) + ellen) % ellen][1].click();
        });

        this._itemcount++;
    }

    _generateSlide(cell, pedestal, subtitle, settings_item, settings) {
        const slide = document.createElement("div");
        const bullet = document.createElement("li");
        const svg_wrap = document.createElement("div");
        const svg = SVG(svg_wrap);

        slide.classList.add('bb-sel-slide');
        svg.node.classList.add('bb-sel-svg');
        svg_wrap.classList.add('bb-sel-svg_wrap');

        const gcell = this.__grid.cell(0, 0);
        const plate = new settings_item.type(
            svg, this.__grid, false, false, undefined, settings.extra
        );

        plate.draw(gcell, 'west');
        plate._container.dmove(-gcell.pos.x, -gcell.pos.y);
        const width = plate._container.width(),
              height = plate._container.width();

        plate._container.center(width / 2, height / 2);

        svg.node.setAttributeNS(
            null,"viewBox", `0 0 ${width} ${height}`
        );

        slide.appendChild(svg_wrap);
        cell.appendChild(slide);
        pedestal.appendChild(bullet);

        bullet.addEventListener(
            'click',
            () => this._onSlideClick(cell, pedestal, subtitle, slide, bullet, settings)
        );

        return [slide, bullet];
    }

    _onSlideClick(cell, pedestal, subtitle, slide, bullet, settings) {
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
                }, {duration: 500, easing: "cubic-bezier(0.16, 1, 0.3, 1)"});
                slide.animate({
                    left: ["0%", '50%']
                }, {duration: 500, easing: "cubic-bezier(0.16, 1, 0.3, 1)"});
            } else {
                // Previous element positioned to the left
                slide_active.animate({
                    left: ["50%", '0%']
                }, {duration: 500, easing: "cubic-bezier(0.16, 1, 0.3, 1)"});
                slide.animate({
                    left: ["100%", '50%']
                }, {duration: 500, easing: "cubic-bezier(0.16, 1, 0.3, 1)"});
            }

            slide_active.classList.remove('active');
            bullet_active.classList.remove('active');
        }

        slide.style.left = "50%";

        bullet.classList.add('active');
        slide.classList.add('active');

        subtitle.innerText = settings.title;
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

        fo.classList.add("bb-sel-root");
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