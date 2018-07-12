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

    onItemClick(cb) {
        if (!cb) {cb = () => {}}

        this._callbacks.itemclick = cb;
    }

    draw(cursor_point, input_values=[]) {
        if (this._active) {
            this.dispose();
        }

        let cell = this.__grid.cell(0,0);

        let nested = this._container.nested();
        nested.addClass(ContextMenu.Class);

        this._drawItems(nested, input_values);

        let offset = {
            x: cell.size.x + this.__grid.gap.x,
            y: cell.size.y * 2 + this.__grid.gap.y
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

        if (pos_global.x > this.__grid.size.x) {nested.dx(-this._size.x)}
        if (pos_global.y > this.__grid.size.y) {nested.dy(-this._size.y)}

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
        let rect = container.rect(0, this._item_height)
                .fill("#e7e4ff")
                .x(-ITEM_TEXT_PADDING)
                .y(this._size.y);

        let label = item_data.label ? item_data.label : item_data.alias;
        let shortcut = item_data.shortcut;
        let active = item_data.active;
        let input = item_data.input;
        let input_node = undefined;

        let text = container.text(label).y(this._size.y).font({size: 24});

        let item_length = 0;

        text.build(true);

        if (shortcut) {
            text.plain(' (');
            text.tspan(shortcut).font({style: 'italic', weight: 'bolder'});
            text.plain(')');
        }

        rect.addClass(ContextMenu.ItemClass);
        text.addClass(ContextMenu.ItemTextClass);

        if (!active) {
            rect.addClass(ContextMenu.ItemDisabledClass);
            text.addClass(ContextMenu.ItemDisabledTextClass);
        }

        this._items.push({rect});

        item_length += text.length();

        text.build(false);

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

        rect.mousedown(() => {
            rect.addClass('bb-cm-item-flash');

            setTimeout(() => {
                let value = input_node ? input_node.value : undefined;

                this._callbacks.itemclick(item_data.alias, value);
                this.dispose();
            }, 100);
        });
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