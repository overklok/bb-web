const ITEM_TEXT_PADDING = 10;
const ITEM_HEIGHT_DEFAULT = 50;
const ITEM_INPUT_WIDTH = 60;

export default class ContextMenu {
    // CSS-класс контейнера контекстного меню
    static get Class() {return "bb-cm"}
    // CSS-класс фона элемента контекстного меню
    static get ItemClass() {return "bb-cm-item"}
    // CSS-класс фона неактивного элемента контекстного меню
    static get ItemDisabledClass() {return "bb-cm-item-disabled"}
    // CSS-класс текста элемента контекстного меню
    static get ItemTextClass() {return "bb-cm-item-text"}
    // CSS-класс текста неактивного элемента контекстного меню
    static get ItemDisabledTextClass() {return "bb-cm-item-disabled-text"}
    // CSS-класс поля ввода элемента контекстного меню
    static get ItemInputClass() {return "bb-cm-item-input"}

    constructor(container, grid, item_height=ITEM_HEIGHT_DEFAULT) {
        this._container_parent = container;
        this._container = container.group().move(0, 0);
        this.__grid = grid;

        this._item_height = item_height;
        this._items_data = [];
        this._items = [];

        this._active = false;

        this._callbacks = {
            itemclick: () => {}
        };

        this._size = {
            x: 0,
            y: 0,
        };
    }

    get active() {
        return this._active;
    }

    onItemClick(cb) {
        if (!cb) {cb = () => {}}

        this._callbacks.itemclick = cb;
    }

    draw(cursor_point, use_offset=false, input_values=[]) {
        if (this._active) {
            this.dispose();
        }

        let cell = this.__grid.cell(0,0);

        let nested = this._container.nested();
        nested.addClass(ContextMenu.Class);

        this._drawItems(nested, input_values);

        let offset = {
            x: use_offset ? (cell.size.x + this.__grid.gap.x) - this.__grid.pos.x : 0,
            y: use_offset ? (cell.size.y * 2 + this.__grid.gap.y) - this.__grid.pos.y : 0
        };

        let pos = {
            x: cursor_point.x - this._container_parent.x() - offset.x,
            y: cursor_point.y - this._container_parent.y() - offset.y
        };

        nested.move(pos.x, pos.y);

        let pos_global = {
            x: cursor_point.x - offset.x + this._size.x,
            y: cursor_point.y - offset.y + this._size.y,
        };

        if (pos_global.x > this.__grid.size.x + this.__grid.pos.x) {nested.dx(-this._size.x)}
        if (pos_global.y > this.__grid.size.y + this.__grid.pos.y) {nested.dy(-this._size.y)}

        nested.addClass('bb-cm-fade-in');

        this._active = true;
    }

    dispose() {
        if (!this._active) return;

        this._container.clear();

        this._size = {
            x: 0,
            y: 0,
        };

        this._items = [];
        this._active = false;
    }

    _drawItems(container, input_values) {
        let i = 0;

        for (let item_data of this._items_data) {
            let input_value = undefined;

            if (i < input_values.length) {
                input_value = input_values[i];
            }

            this._drawItem(container, item_data, input_value);
        }

        this._resizeItems();
    }

    _drawItem(container, item_data, input_value=null) {
        let label = item_data.label ? item_data.label : item_data.alias;
        let shortcut = item_data.shortcut;
        let active = item_data.active;
        let input = item_data.input;
        let input_node = undefined;

        if (typeof label === "function") {
            label = label();
        }

        let rect = this._drawItemRect(container, active);
        let item_length = this._drawItemText(container, label, shortcut, active);

        this._items.push({rect});

        if (input) {
            item_length += 10;
            input_node = this._drawInput(
                container, item_length, this._size.y, `bb-input-${item_data.alias}`,
                input.type, input.min, input.max, input_value
            );

            input_node.classList.add(ContextMenu.ItemInputClass);
            item_length += ITEM_INPUT_WIDTH;
        }

        this._size.x = Math.max(this._size.x, item_length + ITEM_TEXT_PADDING * 2);
        this._size.y += this._item_height;

        this._attachItemEvents(rect, item_data, input, input_node);
    }

    _drawItemRect(container, active) {
        let rect = container.rect(0, this._item_height)
            .fill("#e7e4ff")
            .stroke({color: "#e7e4ff", width: 2, linejoin: "round"})
            .x(-ITEM_TEXT_PADDING)
            .y(this._size.y);

        rect.addClass(ContextMenu.ItemClass);

        if (!active) {
            rect.addClass(ContextMenu.ItemDisabledClass);
        }

        return rect;
    }

    _drawItemText(container, label, shortcut, active) {
        let text = container.text(label).y(this._size.y).font({size: 24});

        text.build(true);

        if (shortcut) {
            text.plain(' (');
            text.tspan(shortcut).font({style: 'italic', weight: 'bolder'});
            text.plain(')');
        }

        text.addClass(ContextMenu.ItemTextClass);

        if (!active) {
            text.addClass(ContextMenu.ItemDisabledTextClass);
        }

        let text_length = text.length();

        text.build(false);

        return text_length;
    }

    _attachItemEvents(rect, item_data, input, input_node) {
        rect.mousedown(() => {
            rect.addClass('bb-cm-item-flash');

            setTimeout(() => {
                if (input && input.type === 'file') {
                    input_node.click();
                    input_node.addEventListener("change", evt => {
                        let value = evt.target.files[0];

                        this._itemClick(item_data, value);
                    });
                }

                let value = input_node ? input_node.value : undefined;

                this.dispose();

                if (!(input && input.type === 'file')) {
                    this._itemClick(item_data, value);
                }
            }, 100);
        });
    }

    /**
     * Вызвать обработчик события "нажат пункт конеткстного меню"
     *
     * @param item_data
     * @param value
     * @private
     */
    _itemClick(item_data, value) {
        let as = item_data.as;

        let alias = as && as.alias ? as.alias : item_data.alias;

        if (as && as.beforeClick) {
            value = as.beforeClick(value);
        }

        this._callbacks.itemclick(alias, value);
    }

    _resizeItems() {
        for (let item of this._items) {
            item.rect.width(this._size.x);
        }
    }

    _drawInput(container, x, y, id, type="number", min=0, max=9000, initial_value=null) {
        let html = this._getEmbeddedHtmlGroup(container, ITEM_INPUT_WIDTH, this._item_height, x, y);

        let input = document.createElement("input");
        input.classList += ContextMenu.ItemInputClass;
        input.id = id ? id : "bb-unnamed-input-" + x + y;
        input.type = type;

        if (type === "number") {
            input.min = min;
            input.max = max;
            input.placeholder = min;
        }

        if (type === "file") {
            input.style.display = "none";
        }

        if (initial_value) {
            input.value = initial_value;
        }

        html.appendChild(input);

        return input;
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