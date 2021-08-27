import SVG from 'svg.js';
import Layer from "../core/Layer";

import "../styles/selector.css";
import ITEMS, { SelectorItem, SelectorItemOption } from "../plates/_selector_items";
import DummyPlate from "../plates/DummyPlate";
import ControlsLayer from "~/js/utils/breadboard/layers/ControlsLayer";
import Plate, { SerializedPlate } from '../core/Plate';
import Grid from '../core/Grid';

/**
 * Contains plate selector flyout menu, which allows to search plates 
 * and drag'n'drop them to the board
 */
export default class SelectorLayer extends Layer<HTMLDivElement> {
    static get Class() {return "bb-layer-selector"}
    static get Items() {return ITEMS}

    /** root container of the flyout */
    private _htmlcontainer: HTMLDivElement;
    /** scrollable area */
    private _area: HTMLDivElement;
    /** list of selector items */
    private _list: HTMLDivElement;
    /** menu controls (buttons) */
    private _controls: HTMLDivElement;

    /** breadboard fullscreen flag */
    private _is_fullscreen: boolean;
    /** is menu should stay opened after free mouse click */
    private _is_pinned: boolean;
    /** TODO */
    private _items: any[];
    /** TODO */
    private _btn_pin: any;
    
    /** local event handlers */
    private _callbacks: {
        /** plate item is started dragging from the selector */
        onplatetake: (plate_data: SerializedPlate, plate_x: any, plate_y: any, cursor_x: any, cursor_y: any) => void;
        /** fullscreen mode requested */
        fullscreen: (is_fullscreen: boolean) => void;
        /** plate removal requested */
        clear: () => void;
        /** menu close request event handler */
        oncloseclick: () => void;
    };

    /**
     * @inheritdoc
     */
    constructor(
        container: HTMLDivElement,
        grid: Grid,
        schematic: boolean = false,
        detailed: boolean = false,
        verbose: boolean = false
    ) {
        super(container, grid, schematic, detailed, verbose);

        this._container.classList.add(SelectorLayer.Class);

        this._callbacks = {
            oncloseclick: this._handleCloseClick.bind(this),
            onplatetake: (plate_data, plate_x, plate_y, cursor_x, cursor_y) => { },
            clear: () => { },
            fullscreen: () => { },
        };

        this._is_pinned = false;

        this._items = [];

        this._htmlcontainer = undefined;

        this.hide();
    }

    /**
     * @inheritdoc
     */
    public compose() {
        this._htmlcontainer = document.createElement("div");
        this._htmlcontainer.classList.add("bb-sel-root");
        this._container.appendChild(this._htmlcontainer);

        this._items = [];

        this._appendBasics();
        this._appendControls();

        for (const item of ITEMS) {
            this._items.push(this._appendItem(item));
        }

        this._filterItems();

        document.addEventListener('keyup', this._handleKey.bind(this), false);
    }

    /**
     * @inheritdoc
     */
    public show() {
        this._container.style.left = `4px`;
        this.reveal();
    }

    /**
     * @inheritdoc
     */
    public hide() {
        this._container.style.left = `-${this._container.offsetWidth + this._container.offsetLeft}px`;
    }

    /**
     * Makes flyout translucent
     * 
     * At the moment of dragging, it might be useful to make the menu half-opaque
     * to see the board cells. To rollback the opacity, see {@link reveal}.
     */
    public conceal() {
        this._container.style.opacity = '0.5';
    }

    /**
     * Makes flyout opaque
     * 
     * 
     * @see {@link conceal}
     */
    public reveal() {
        this._container.style.opacity = '1';
    }

    /**
     * Toggles pin state
     * 
     * When toggled, the flyout wouldn't hide on free mouse clicks.
     * It's still possible to close the menu permanently (@link close}).
     */
    public togglePin() {
        this._is_pinned = !this._is_pinned;

        if (this._is_pinned) {
            this.show();
            this._btn_pin.innerHTML = 'Открепить';
        } else {
            this.hide();
            this._btn_pin.innerHTML = 'Закрепить';
        }
    }

    /**
     * Shows the flyout unpinned
     * 
     * @param permanently pin the flyout
     */
    public open(permanently=false) {
        this.show();

        if (!permanently) {
            document.addEventListener('click', this._callbacks.oncloseclick);
        }
    }

    /**
     * Hides the flyout 
     * 
     * @param permanently unpin (this is required if the flyout were pinned previously)
     */
    public close(permanently=false) {
        this.hide();

        // Unpin if requested to close manually
        this._is_pinned = false;

        if (!permanently) {
            document.removeEventListener('click', this._callbacks.oncloseclick);
        }
    }

    /**
     * Attaches a callback handler to 'plate drag started' event
     * 
     * @param cb callback handler to attach
     */
    public onPlateTake(cb: (
        plate_data: {},
        plate_x: number,
        plate_y: number,
        cursor_x: number,
        cursor_y: number
    ) => void) {
        if (!cb) this._callbacks.onplatetake = () => {};

        this._callbacks.onplatetake = cb;
    }

    /**
     * Attaches a callback handler to 'board clean' button click event
     * 
     * @param cb callback handler to attach
     */
    public onClear(cb: () => void) {
        if (!cb) {
            this._callbacks.clear = () => {};
        } else {
            this._callbacks.clear = cb;
        }
    }

    /**
     * Attaches a callback handler to 'toggle fullscreen' button click event
     * 
     * @param cb callback handler to attach
     */
    public onFullscreen(cb: (on: boolean) => void) {
        if (!cb) {
            this._callbacks.fullscreen = () => {};
        } else {
            this._callbacks.fullscreen = cb;
        }
    }

    /**
     * Handles menu close request
     * 
     * @param evt document click event
     */
    private _handleCloseClick(evt: MouseEvent) {
        let el = evt.target as Element;

        if (el.id === ControlsLayer.MenuButtonId) return;

        /// Define if the element clicked is a part of the layer or is the close button
        while (
            (el = el.parentElement) &&
            !(el.classList.contains(SelectorLayer.Class)) &&
            el.id !== ControlsLayer.MenuButtonId
        ) {}

        if (!el) {
            if (!this._is_pinned) {
                this.close();
            }
        }
        
        if (this._is_pinned) {
            this.reveal();
        }
    }

    /**
     * Filters items in the list by their tags
     * 
     * Hides items for which none of the space-delimited tags does not match the query string.
     * The match is correct when the query is a substring of at least one of the tags.
     * 
     * @param query case-insensitive request string
     */
    private _filterItems(query="") {
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

    /**
     * Constructs the root container hierarchy
     */
    private _appendBasics() {
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

    /**
     * Initializes DOM elements for button controls
     */
    private _appendControls() {
        let btn_clear = document.createElement("a");
        let btn_fullscreen = document.createElement("a");
        let btn_pin = document.createElement("a");
        let inp_search = document.createElement("input");

        this._btn_pin = btn_pin;

        btn_clear.classList.add("bb-sel-btn-clear");
        btn_fullscreen.classList.add("bb-sel-btn-fullscreen");
        btn_pin.classList.add("bb-sel-btn-pin");
        inp_search.classList.add("bb-sel-inp-search");

        inp_search.setAttribute("placeholder", "Поиск");

        btn_clear.addEventListener("click", () => {
            this._callbacks.clear();
        });

        btn_fullscreen.addEventListener("click", () => {
            this._is_fullscreen = !this._is_fullscreen;
            this._callbacks.fullscreen(this._is_fullscreen);

            btn_fullscreen.innerHTML = this._is_fullscreen ? "Свернуть" : "Во весь экран";
        });

        btn_pin.addEventListener("click", () => {
            this.togglePin();
        });

        inp_search.addEventListener("input", () => {
            this._filterItems(inp_search.value);
        })

        btn_clear.innerHTML = "Очистить всё";
        btn_fullscreen.innerHTML = "Во весь экран";
        btn_pin.innerHTML = this._is_pinned ? "Открепить" : "Закрепить";

        this._controls.appendChild(btn_clear);
        this._controls.appendChild(btn_fullscreen);
        this._controls.appendChild(btn_pin);
        this._controls.appendChild(inp_search);
    }

    /**
     * Renders single item (cell) for the selector list
     * 
     * @param settings item settings
     * 
     * @returns the item rendered
     */
    private _appendItem(settings: SelectorItem): HTMLDivElement {
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

        const elements: [HTMLElement, HTMLElement, SVG.Doc][] = [];

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

        if (!settings.custom) {
            inp_custom.style.display = "none";
        } else {
            const option = settings.custom.default;
            const prop_key = settings.custom.property_key;

            inp_custom.style.display = "display";

            const generated = this._generateSlide(slider, pedestal, subtitle, settings, option, true);

            elements.push(generated);
            const [slide, bullet, svg] = generated;

            inp_custom.addEventListener('input', () => {
                bullet.click();
                this._updateSlide(
                    slide, svg, subtitle, settings, {
                        title: `${option.title} [${inp_custom.value}]`,
                        properties: {
                            [prop_key]: inp_custom.value
                        }
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

    /**
     * Generates a single option (slide) for the item (cell)
     * 
     * @param cell          selector list item (plate type)
     * @param pedestal      bullet container
     * @param subtitle      caption for the option
     * @param settings_item related list item settings
     * @param settings      settings for related option
     * @param bullet_custom is the option is customizable
     * 
     * @returns element triplet (`slide`, `bullet`, `svg`), where 
     *          `slide` is the desired slide, 
     *          `bullet` is related bullet button instance,
     *          `svg` is an SVG container which contains the plate preview.
     */
    private _generateSlide(
        cell: HTMLElement,
        pedestal: HTMLElement,
        subtitle: HTMLElement,
        settings_item: SelectorItem,
        settings: SelectorItemOption,
        bullet_custom: boolean = false
    ): [HTMLElement, HTMLElement, SVG.Doc] {
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

    /**
     * Updates the slide details
     * 
     * The method can be used to generate new slide (based on pre-generated containers)
     * and also to update existing slides.
     * 
     * Re-renders the plate preview based on the new option properties.
     * 
     * @param slide         the slide needed to update
     * @param svg           its related SVG container with the plate drawn
     * @param subtitle      its related HTML container with subtitle text
     * @param settings_item its related settings data object
     * @param settings      new details to update (title, properties)
     */
    private _updateSlide(
        slide: HTMLElement,
        svg: SVG.Doc,
        subtitle: HTMLElement,
        settings_item: SelectorItem,
        settings: SelectorItemOption
    ) {
        svg.node.innerHTML = "";

        const gcell = this.__grid.cell(0, 0);

        let plate: Plate,
            error_message = null;

        try {
            plate = new settings_item.type(svg, this.__grid, false, false, undefined, settings.properties);
            plate.draw(gcell, 'west');
        } catch (e) {
            plate = new DummyPlate(svg, this.__grid, false, false);
            plate.draw(gcell, 'west');
            error_message = e;
            console.error(e);
        }

        plate.move_to_point(0, 0);

        const width = plate.container.width(),
              height = plate.container.width();

        plate.container.center(width / 2, height / 2);

        svg.node.setAttributeNS(
            null,"viewBox", `0 0 ${width} ${height}`
        );

        slide.onmousedown = (evt: MouseEvent) => this._onSlideHold(evt, svg.node, plate);

        slide.setAttribute('data-title', settings.title);

        if (error_message) {
            subtitle.innerHTML = `<p style="color: red;">${error_message}</p>`
        } else {
            subtitle.innerHTML = settings.title;
        }
    }

    /**
     * Handles 'bullet click' mouse event
     * 
     * Switches active option for the item
     * 
     * @param cell      selector list item container (plate type)
     * @param pedestal  bullet list container
     * @param subtitle  HTML text container with subtitle text
     * @param slide     item option container (plate preset)
     * @param bullet    its related bullet button
     */
    private _onBulletClick(
        cell: HTMLElement,
        pedestal: HTMLElement,
        subtitle: HTMLElement,
        slide: HTMLElement,
        bullet: HTMLElement
    ) {
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

    /**
     * Handles 'slide (plate) drag start' event
     * 
     * Dragging here should be understood not only moving the plate, but also clicking it,
     * because plate will be mounted on the board even after a single click.
     * 
     * @param evt       original mouse click event
     * @param svg_node  SVG element that contains the plate preview
     * @param plate     the plate whose preview are rendered in the SVG element
     */
    private _onSlideHold(evt: MouseEvent, svg_node: Element, plate: Plate) {
        if (evt.which !== 1) return;

        const rect = svg_node.getBoundingClientRect();

        this._callbacks.onplatetake(
            plate.serialize(),
            rect.left + rect.width/2, rect.top + rect.height/2,
            evt.clientX, evt.clientY
        );

        if (this._is_pinned) {
            this.conceal();
        } else {
            this.close();
        }
    }

    /**
     * Gets the number of the element in the parent node
     * 
     * @param node 
     * 
     * @returns number of the given element in its parent node
     */
    private _getElementIndex(node: NonDocumentTypeChildNode) {
        let index = 0;
        while ( (node = node.previousElementSibling) ) {index++;}
        return index;
    }

    /**
     * Handles global keyboard event to toggle the flyout pin
     * 
     * @param evt original keyboard event
     */
    private _handleKey(evt: KeyboardEvent) {
        if (evt.code === 'KeyM') {
            this.togglePin();
        }
    }
}