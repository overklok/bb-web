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
    static get ItemDividerClass() {return "bb-menu-item-divider"}
    static get ItemShortcutClass() {return "bb-menu-item-shortcut"}

    static get TransitionTime() {return 100}

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

    fadeOut(cb_destroy) {
        this._container.style.opacity = 0;

        setTimeout(() => {
            cb_destroy && cb_destroy();
        }, ContextMenu.TransitionTime);
    }

    draw(position, inputs=[]) {
        this._container = document.createElement('div');
        this._container.classList.add(ContextMenu.Class);
        this._container.style.opacity = 0;
        this._container.style.transition = `opacity linear ${ContextMenu.TransitionTime}ms`;

        this._drawItems(inputs);

        setTimeout(() => {this._container.style.opacity = 1;}, 0);

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
        let active = item_data.active;
        let input = item_data.input;

        let shortcuts = item_data.shortcuts ? item_data.shortcuts : item_data.shortcut;
        let is_shortcut_combined = Array.isArray(item_data.shortcut);

        if (!Array.isArray(shortcuts)) {
            shortcuts = shortcuts ? [shortcuts] : [];
        }

        let input_node = undefined;

        if (item_data.shortcuts) {}

        if (typeof label === "function") {
            label = label();
        }

        const root = document.createElement('div');
        root.classList.add(ContextMenu.ItemClass);

        if (!active) {
            root.classList.add(ContextMenu.ItemDisabledClass);
        }

        // Add item text
        const text = document.createElement('div');
        text.innerText = label;
        text.classList.add(ContextMenu.ItemTextClass);
        root.appendChild(text);

        // Add input
        if (input) {
            input_node = this._drawInput(
                `bb-input-${item_data.alias}`,
                input.type, input.min, input.max, input_value
            );

            root.appendChild(input_node);

            input_node.classList.add(ContextMenu.ItemInputClass);
        }

        // Add spacer
        const divider = document.createElement('div')
        divider.classList.add(ContextMenu.ItemDividerClass);
        root.appendChild(divider);

        // Add shortcuts
        if (shortcuts) {
            for (let i = 0; i < shortcuts.length; i++) {
                const shortcut_component = shortcuts[i];

                if (!shortcut_component) continue;

                const short = document.createElement('div');
                short.innerText = shortcut_component;
                short.classList.add(ContextMenu.ItemShortcutClass);
                root.appendChild(short);

                if (is_shortcut_combined && i < shortcuts.length - 1) {
                    const joint = document.createElement('div');
                    joint.innerText = '+';
                    root.appendChild(joint);
                }
            }
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
            initial_value = Number(initial_value) || 0;
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