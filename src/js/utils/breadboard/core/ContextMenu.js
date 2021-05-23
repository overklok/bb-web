export default class ContextMenu {
    // CSS-класс контейнера контекстного меню
    static get Class() {return "bb-menu"}
    // CSS-класс фона элемента контекстного меню
    static get ItemClass() {return "bb-menu-item"}
    // CSS-класс фона неактивного элемента контекстного меню
    static get ItemDisabledClass() {return "bb-menu-item_disabled"}
    static get ItemAcceptedClass() {return "bb-menu-item_accepted"}
    static get ItemInputClass() {return "bb-menu-item-input"}
    static get ItemTextClass() {return "bb-menu-item-text"}
    static get ItemShortcutClass() {return "bb-menu-item-shortcut"}

    constructor(item_id) {
        this._item_id = item_id;
        this._container = undefined;

        this._items_data = [];

        this._size = {
            x: 0,
            y: 0,
        };

        this._itemclick = undefined;
    }

    addItem(alias, label, active=true) {
        this._items_data.push({
            alias, label, active
        });
    }

    get container() {
        return this._container;
    }

    onItemClick(cb) {
        this._itemclick = cb;
    }

    draw(position, inputs=[]) {
        this._container = document.createElement('div');
        this._container.classList.add(ContextMenu.Class);

        this._drawItems(inputs);

        this._container.style.left = `${position.x}px`;
        this._container.style.top = `${position.y}px`;

        return this._container;
    }

    dispose() {
        while(this._container.firstChild) {
            this._container.removeChild(this._container.firstChild);
        }
    }

    _drawItems(inputs) {
        let i = 0;

        for (let item_data of this._items_data) {
            let input_value = undefined;

            if (i < inputs.length) {
                input_value = inputs[i];
            }

            this._container.appendChild(
                this._drawItem(item_data, input_value)
            );
        }
    }

    _drawItem(item_data, input_value=null) {
        let label = item_data.label ? item_data.label : item_data.alias;
        let shortcut = item_data.shortcut;
        let active = item_data.active;
        let input = item_data.input;
        let input_node = undefined;

        if (typeof label === "function") {
            label = label();
        }

        const root = document.createElement('div');
        root.classList.add(ContextMenu.ItemClass);

        if (!active) {
            root.classList.add(ContextMenu.ItemDisabledClass);
        }

        const text = document.createElement('span');
        text.innerText = label;
        text.classList.add(ContextMenu.ItemTextClass);
        root.appendChild(text);

        if (shortcut) {
            const short = document.createElement('small');
            short.innerText = shortcut;
            text.appendChild(short);
            short.classList.add(ContextMenu.ItemShortcutClass);
        }

        if (input) {
            input_node = this._drawInput(
                `bb-input-${item_data.alias}`,
                input.type, input.min, input.max, input_value
            );

            root.appendChild(input_node);

            input_node.classList.add(ContextMenu.ItemInputClass);
        }

        this._attachItemEvents(root, item_data, input, input_node);

        return root;
    }

    _drawInput(id, type="number", min=0, max=9000, initial_value=null) {
        let input = document.createElement("input");
        input.classList.add(ContextMenu.ItemInputClass);
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

        return input;
    }

    _attachItemEvents(root, item_data, input, input_node) {
        const apply = () => {
            setTimeout(() => {
                if (input && input.type === 'file') {
                    input_node.click();
                    input_node.addEventListener("change", evt => {
                        const value = evt.target.files[0];

                        this._itemClick(item_data, value);
                    });
                }

                const value = input_node ? input_node.value : undefined;

                this.dispose();

                if (!(input && input.type === 'file')) {
                    this._itemClick(item_data, value);
                }
            }, 100);
        }

        if (input && input.type !== 'file') {
            input_node.addEventListener("keyup", (event) => {
                if (event.keyCode === 13) {
                    apply();
                }
            })
        }

        root.addEventListener('mousedown', (evt) => {
            if (evt.target.classList.contains(ContextMenu.ItemInputClass)) return;

            root.classList.add(ContextMenu.ItemAcceptedClass);
            apply();
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

        this._itemclick(this._item_id, alias, value);
    }
}