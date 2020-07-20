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
import Plate from "../core/Plate";

const ITEMS = [
    {
        title: "Перемычка",
        type: BridgePlate,
        tags: "перемычка мост bridge",
        options: [
            {title: "2 клетки", extra: 2},
            {title: "3 клетки", extra: 3},
            {title: "4 клетки", extra: 4},
            {title: "5 клеток", extra: 5},
            {title: "6 клеток", extra: 6},
        ],
        custom: {
            default: {title: "Свой размер", extra: 2}
        }
    },
    {
        title: "Светодиод",
        tags: "светодиод лампа свет led diode light",
        type: LEDPlate,
        options: [
            {title: "Зелёный", extra: "G"},
            {title: "Красный", extra: "R"}
        ]
    },
    {
        title: "Резистор",
        tags: "резистор сопротивление resistor",
        type: ResistorPlate,
        options: [
            {title: "200 Ом",   extra: 200},
            {title: "1 кОм",    extra: 1000},
            {title: "10 кОм",   extra: 10000},
            {title: "30 кОм",   extra: 30000},
        ],
        custom: {
            default: {title: "Свой номинал (кОм)", extra: 100}
        }
    },
    {
        title: "Конденсатор",
        tags: "конденсатор ёмкость емкость capacitor",
        type: CapacitorPlate,
        options: [
            {title: "100 мкФ", extra: 1e-4},
            {title: "1000 мкФ", extra: 1e-3},
        ],
        custom: {
            default: {title: "Своя ёмкость (пкФ)", extra: 200}
        }
    },

    {
        title: "Транзистор",
        tags: "транзистор transistor",
        type: TransistorPlate,
        options: [{title: "Обычный"}],
    },
    {
        title: "Фоторезистор",
        tags: "фоторезистор photoresistor",
        type: PhotoresistorPlate,
        options: [{title: "Обычный"}]
    },
    {
        title: "Реостат",
        tags: "реостат резистор переменный rheostat resistor variable",
        type: RheostatPlate,
        options: [{title: "Обычный"}]
    },
    {
        title: "Кнопка",
        tags: "кнопка button",
        type: ButtonPlate,
        options: [{title: "Обычная"}]
    },
    {
        title: "Кнопка-3",
        tags: "кнопка button",
        type: TButtonPlate,
        options: [{title: "Обычная"}]
    },
    {
        title: "Ключ",
        tags: "ключ switch",
        type: SwitchPlate,
        options: [{title: "Обычный"}]
    },
    {
        title: "Индуктор",
        tags: "индуктор индуктивность катушка inductor inductance coil",
        type: InductorPlate,
        options: [{title: "Обычный"}]
    },
    {
        title: "Реле",
        tags: "реле relay",
        type: RelayPlate,
        options: [{title: "Обычное"}]
    },
    {
        title: "Зуммер",
        tags: "зуммер пищалка buzzer beeper",
        type: BuzzerPlate,
        options: [{title: "Обычный"}]
    },
    {
        title: "Dummy",
        tags: "dummy",
        type: DummyPlate,
        options: [{title: "Обычная"}]
    },
]

export default class SelectorLayer extends Layer {
    static get Class() {return "bb-layer-selector"}

    constructor(container, grid) {
        super(container, grid);

        this._container.addClass(SelectorLayer.Class);

        this._callbacks = {
            onplatetake: (plate_data, plate_x, plate_y, cursor_x, cursor_y) => {},
            clear: () => {},
            fullscreen: () => {},
        };

        this._items = [];

        this.hide();
    }

    compose() {
        this._htmlcontainer = this._getEmbeddedHtmlGroup(this._container, '30%', '99%')
        this._items = [];

        this._appendBasics();
        this._appendControls();

        for (const item of ITEMS) {
            this._items.push(this._appendItem(item));
        }

        this._filterItems();

        document.addEventListener('click', (evt) => this._closeOnClick(evt));
        document.addEventListener('mousedown', (evt) => this._closeOnClick(evt));
    }

    open() {
        this._container.opacity(0).show().animate('100ms').opacity(1);
        setTimeout(() => {this._opened = true;}, 100);
    }

    close() {
        this._opened = false;

        this._container.animate('100ms').opacity(0);
        setTimeout(() => this.hide(), 100);
    }

    onPlateTake(cb) {
        if (!cb) this._callbacks.onplatetake = () => {};

        this._callbacks.onplatetake = cb;
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

    _closeOnClick(evt) {
        let el = evt.target;

        /// Определить, является ли элемент, по которому выполнено нажатие, частью слоя
        while ((el = el.parentElement) && !(el.classList.contains(SelectorLayer.Class))) {}

        if (!el && this._opened) {
            this.close();
        }
    }

    _filterItems(query="") {
        query = query.trim();

        for (const item of this._items) {
            const tags = item.getAttribute("data-tags").split(" ");

            let found = false;

            for (const tag of tags) {
                if (tag.indexOf(query.toLowerCase()) !== -1) {
                    found = true;
                    break;
                }
            }

            if (found) {
                item.style.display = "block";
            } else {
                item.style.display = "none";
            }
        }
    }

    _appendBasics() {
        this._area = document.createElement("div");
        this._area.classList.add('bb-sel-area');

        this._list = document.createElement("div");
        this._list.classList.add('bb-sel-list');

        this._controls = document.createElement("div");
        this._controls.classList.add('bb-sel-controls');

        this._area.appendChild(this._list);

        this._htmlcontainer.appendChild(this._controls);
        this._htmlcontainer.appendChild(this._area);
    }

    _appendControls() {
        let btn_clear = document.createElement("a");
        let btn_fullscreen = document.createElement("a");
        let inp_search = document.createElement("input");

        btn_clear.classList.add("bb-sel-btn-clear");
        btn_fullscreen.classList.add("bb-sel-btn-fullscreen");
        inp_search.classList.add("bb-sel-inp-search");

        inp_search.setAttribute("placeholder", "Поиск")

        btn_clear.addEventListener("click", () => {
            this._callbacks.clear();
        });

        btn_fullscreen.addEventListener("click", () => {
            this._is_fullscreen = !this._is_fullscreen;
            this._callbacks.fullscreen(this._is_fullscreen);

            btn_fullscreen.innerHTML = this._is_fullscreen ? "Свернуть" : "Во весь экран";
        });

        inp_search.addEventListener("input", () => {
            this._filterItems(inp_search.value);
        })

        btn_clear.innerHTML = "Очистить всё";
        btn_fullscreen.innerHTML = "Во весь экран";

        this._controls.appendChild(btn_clear);
        this._controls.appendChild(btn_fullscreen);
        this._controls.appendChild(inp_search);
    }

    _appendItem(settings) {
        if (!settings.options) return;

        const cell = document.createElement("div");
        const slider = document.createElement("div");
        const slidectrl_left = document.createElement("div");
        const slidectrl_right = document.createElement("div");
        const pedestal_wrap = document.createElement("div");
        const pedestal = document.createElement("ul");
        const title = document.createElement("div");
        const subtitle = document.createElement("div");
        const inp_custom = document.createElement("input");

        cell.setAttribute('data-tags', settings.tags || "");

        cell.classList.add('bb-sel-cell');
        slider.classList.add('bb-sel-slider');

        pedestal_wrap.classList.add('bb-sel-pedestal-wrap');
        pedestal.classList.add('bb-sel-pedestal');
        slidectrl_left.classList.add('bb-sel-slidectrl', 'bb-sel-slidectrl-left');
        slidectrl_right.classList.add('bb-sel-slidectrl', 'bb-sel-slidectrl-right');
        title.classList.add('bb-sel-title');
        subtitle.classList.add('bb-sel-subtitle');
        inp_custom.classList.add('bb-sel-inp-custom');

        const elements = [];

        for (const option of settings.options) {
            elements.push(
                this._generateSlide(slider, pedestal, subtitle, settings, option)
            )
        }

        pedestal_wrap.appendChild(subtitle);
        pedestal_wrap.appendChild(pedestal);

        slider.appendChild(slidectrl_left);
        slider.appendChild(slidectrl_right);

        cell.appendChild(title);
        cell.appendChild(inp_custom);
        cell.appendChild(slider);
        cell.appendChild(pedestal_wrap);

        this._list.appendChild(cell);

        title.innerText = settings.title;

        slidectrl_right.innerText = ">";
        slidectrl_left.innerText = "<";

        if (!settings.custom) {
            inp_custom.style.display = "none";
        } else {
            const option = settings.custom.default;

            inp_custom.style.display = "display";
            const [slide, bullet, svg] =
                this._generateSlide(slider, pedestal, subtitle, settings, option, true);

            inp_custom.addEventListener('input', () => {
                bullet.click();
                this._updateSlide(
                    slide, svg, subtitle, settings, {
                        title: `${option.title} [${inp_custom.value}]`,
                        extra: inp_custom.value
                    }
                );
            })
        }

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

        return cell;
    }

    _generateSlide(cell, pedestal, subtitle, settings_item, settings, bullet_custom=false) {
        const slide = document.createElement("div");
        const bullet = document.createElement("li");
        const svg_wrap = document.createElement("div");
        const svg = SVG(svg_wrap);

        slide.classList.add('bb-sel-slide');
        svg.node.classList.add('bb-sel-svg');
        svg_wrap.classList.add('bb-sel-svg_wrap');

        if (bullet_custom) {
            bullet.classList.add('custom');
        }

        this._updateSlide(slide, svg, subtitle, settings_item, settings);

        slide.appendChild(svg_wrap);
        cell.appendChild(slide);
        pedestal.appendChild(bullet);

        bullet.addEventListener(
            'click',
            () => this._onBulletClick(cell, pedestal, subtitle, slide, bullet)
        );

        return [slide, bullet, svg];
    }

    _updateSlide(slide, svg, subtitle, settings_item, settings) {
        svg.node.innerHTML = "";

        const gcell = this.__grid.cell(0, 0);

        let plate,
            error_message = null;

        try {
            plate = new settings_item.type(svg, this.__grid, false, false, undefined, settings.extra);
            plate.draw(gcell, 'west');
        } catch (e) {
            plate = new DummyPlate(svg, this.__grid, false, false);
            plate.draw(gcell, 'west');
            error_message = e;
            console.error(e);
        }

        plate.move_to_point(0, 0);

        const width = plate._container.width(),
              height = plate._container.width();

        plate._container.center(width / 2, height / 2);

        svg.node.setAttributeNS(
            null,"viewBox", `0 0 ${width} ${height}`
        );

        slide.onmousedown = (evt) => this._onSlideHold(evt, svg.node, plate);

        slide.setAttribute('data-title', settings.title);

        if (error_message) {
            subtitle.innerHTML = `<p style="color: red;">${error_message}</p>`
        } else {
            subtitle.innerHTML = settings.title;
        }
    }

    _onBulletClick(cell, pedestal, subtitle, slide, bullet) {
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

        subtitle.innerText = slide.getAttribute('data-title');
    }

    _onSlideHold(evt, svg_node, plate) {
        if (evt.which !== 1) return;

        const rect = svg_node.getBoundingClientRect();

        this._callbacks.onplatetake(
            plate.serialize(),
            rect.left + rect.width/2, rect.top + rect.height/2,
            evt.clientX, evt.clientY
        );

        this.close();
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