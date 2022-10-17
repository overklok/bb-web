import { XYPoint } from "./extras/types"


/**
 * Type of context menu item input
 *
 * @category Breadboard
 */
export enum ContextMenuItemInputType {
    String = 'string',
    Number = 'number',
    File = 'file'
}

/**
 * Properties of context menu item input
 * 
 * If needed, `min` and `max` might be set for {@link ContextMenuItemInputType.Number} items.
 *
 * @category Breadboard
 */
export type ContextMenuItemInputProps = {
    type: ContextMenuItemInputType,
    min?: number,
    max?: number
}

/**
 * Context menu item properties
 *
 * @category Breadboard
 */
export type ContextMenuItemProps = {
    /** Text label which will be displayed to user */
    label: string | Function,

    /** String alias to reference in sources */
    alias?: string,
    /** 
     * Whether the item can be activated 
     * 
     * Inactive items are used when it's needed to display some information 
     * or to add a sort of a delimiter to the item list.
     */
    active: boolean,

    /** 
     * Optional input type 
     */
    input?: ContextMenuItemInputProps,

    /**
     * Keyboard shortcut / shortcut combination
     * NB: it would still be required to handle it manually
     */
    shortcut?: string | string[],
    
    /** 
     * Keyboard shortcut options. Use it when the item has multiple binds.
     * NB: it would still be required to handle it manually
     * NB2: if the `shortcut` option is specified, this option will overwrite it.
     */
    shortcuts?: string[],

    /** 
     * Present the item _as_ another item with the type already registered in {@link ContextMenu}
     * to prevent alias duplication.
     * 
     * Someteimes it's needed to provide a menu item that is functionally the same, 
     * but with some modification. This option allows to fire the same event but with the different alias.
     */
    as?: {
        /** Alias of original menu item which is going to be duplicated */
        alias: string,
        /** Custom item click handler to modify menu's internal state or smth else */
        beforeClick?: (value: number|string|boolean|File|void) => number|string|boolean|void|File
    }
}

/**
 * Basic context menu drawer
 * 
 * TODO: Make this class an inheritor of Plate
 *
 * @category Breadboard
 */
export default class ContextMenu {
    /** 
     * Identifier of the object that called the 
     * menu to refer it on further handling 
     */
    private _caller_id: number

    /** Root HTML container */
    private _container: HTMLDivElement;

    /** List of {@link ContextMenu} items properties */
    protected _items_props: ContextMenuItemProps[];

    /** An 'item click' event handler */
    private _itemclick: Function;

    // CSS class of the root container of the menu
    static Class = "bb-menu"
    // CSS class of menu item background
    static ItemClass = "bb-menu-item"
    // CSS class of inactive menu item background
    static ItemDisabledClass = "bb-menu-item_disabled"
    // CSS class of accepted menu item background
    static ItemAcceptedClass = "bb-menu-item_accepted"
    // CSS class of menu item input element 
    static ItemInputClass = "bb-menu-item-input"
    // CSS class of menu item text 
    static ItemTextClass = "bb-menu-item-text"
    // CSS class of menu item divider 
    static ItemDividerClass = "bb-menu-item-divider"
    // CSS class of menu item shortcut 
    static ItemShortcutClass = "bb-menu-item-shortcut"

    // Menu fade in/out transition time
    static TransitionTime = 100

    /**
     * Creates an instance of ContextMenu
     * 
     * An optional arbitrary caller object ID can be provided 
     * to pass it to the item click handler 
     * 
     * @param item_id an arbitrary optional caller object identifier
     */
    constructor(item_id?: number, item_type?: string, item_variant?: string) {
        this._caller_id = item_id;
        this._container = undefined;

        this._items_props = [];

        this._itemclick = undefined;
    }

    /** 
     * Publicly accessible root HTML container of the {@link ContextMenu}
     */
    public get container(): HTMLDivElement {
        return this._container;
    }

    /**
     * Adds an item to the {@link ContextMenu}
     * 
     * Note that this method should be called before drawing.
     * It helps modifying the item list on-the-go, after instantiation of class.
     * 
     * @see draw 
     * 
     * @param alias     item alias
     * @param label     item label to display
     * @param active    whether the item should be active
     */
    public addItem(alias: string, label: string, active: boolean = true): void {
        this._items_props.push({
            alias, label, active
        });
    }

    /**
     * Attach an 'item click' event handler
     * 
     * @param cb callback or null to clear
     */
    public onItemClick(cb: Function = null): void {
        this._itemclick = cb || (() => {});
    }

    /**
     * Animates menu hiding
     * 
     * An additional callback is required to pass. It will be called
     * when the animation ends, so the menu can be removed from the DOM.
     * 
     * Transition time is defined by the {@link TransitionTime} value.
     * 
     * @param cb_destroy callback which will be called when the menu will be ready to destroy.
     */
    public hide(cb_destroy: Function): void {
        this._container.style.opacity = '0';

        setTimeout(() => {
            cb_destroy && cb_destroy();
        }, ContextMenu.TransitionTime);
    }

    /**
     * Renders {@link ContextMenu} contents to DOM
     * 
     * This method returns the root HTML container where the contents is drawn
     * 
     * @param position  position when the right click is occurred
     * @param inputs    optional input values to pass into the items that has input fields
     */
    public draw(position: XYPoint, inputs: any[] = []): HTMLDivElement {
        this._container = document.createElement('div');
        this._container.classList.add(ContextMenu.Class);
        this._container.style.opacity = '0';
        this._container.style.transition = `opacity linear ${ContextMenu.TransitionTime}ms`;

        this._drawItems(inputs);

        setTimeout(() => {this._container.style.opacity = '1'}, 0);

        return this._container;
    }

    /**
     * Removes all content drawn by the {@link draw} method
     */
    public clear(): void {
        while(this._container.firstChild) {
            this._container.removeChild(this._container.firstChild);
        }

        // this._container.remove();
    }

    /**
     * Renders all menu items
     * 
     * @param inputs values for optional menu item fields
     */
    private _drawItems(inputs: any[]): void {
        let i = 0;

        for (let item_props of this._items_props) {
            let input_value = undefined;

            if (i < inputs.length) {
                input_value = inputs[i];
            }

            this._container.appendChild(
                this._drawItem(item_props, input_value)
            );
        }
    }

    /**
     * Renders single menu item
     * 
     * Function creates div container, generates the content,
     * and returns the container as a result.
     * 
     * @param item_props     menu item config
     * @param input_value    initial input field value
     */
    private _drawItem(item_props: ContextMenuItemProps, input_value: any = null): HTMLDivElement {
        let label = item_props.label ? item_props.label : item_props.alias;
        let active = item_props.active;
        let input = item_props.input;

        let shortcuts = item_props.shortcuts ? item_props.shortcuts : item_props.shortcut;
        let is_shortcut_combined = Array.isArray(item_props.shortcut);

        if (!Array.isArray(shortcuts)) {
            shortcuts = shortcuts ? [shortcuts] : [];
        }

        let input_node = undefined;

        if (item_props.shortcuts) {}

        const root = document.createElement('div');
        root.classList.add(ContextMenu.ItemClass);

        if (!active) {
            root.classList.add(ContextMenu.ItemDisabledClass);
        }

        // Add item text
        const text = document.createElement('div');

        if (typeof label === "function") {
            text.innerText = label();
        } else {
            text.innerText = label;
        }

        text.classList.add(ContextMenu.ItemTextClass);
        root.appendChild(text);

        // Add input
        if (input) {
            input_node = this._drawInput(
                `bb-input-${item_props.alias}`,
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

        this._attachItemEvents(root, item_props, input, input_node);

        return root;
    }

    /**
     * Renders an input field for specific menu item
     * 
     * @param id            dom node id for the item
     * @param type          input type (e.g. number, text, file)
     * @param min           min value for the input (if applicable)
     * @param max           max value for the input (if applicable)
     * @param initial_value initial value for the input
     * 
     * @returns generated html element ready to be mounted to the DOM
     */
    private _drawInput(
        id: string,
        type: ContextMenuItemInputType,
        min: number = 0,
        max: number = 9000,
        initial_value: number | string = null
    ): HTMLInputElement {
        let input = document.createElement("input");
        input.classList.add(ContextMenu.ItemInputClass);
        input.id = id ? id : `bb-unnamed-input-${type}`;

        if (type === ContextMenuItemInputType.Number) {
            input.type = "number";
            input.min = String(min);
            input.max = String(max);
            input.placeholder = String(min);
            initial_value = Number(initial_value) || 0;
        }

        if (type === ContextMenuItemInputType.String) {
            input.type = "string";
            input.style.display = "none";
        }

        if (type === ContextMenuItemInputType.File) {
            input.type = "file";
            input.style.display = "none";
        }

        if (initial_value) {
            input.value = String(initial_value);
        }

        return input;
    }

    /**
     * Attach handlers to menu item events
     * 
     * @param root          root HTML container of the menu item
     * @param item_props    properties of the menu item
     * @param input_props   properties of the input field
     * @param input_node    input field HTML element
     */
    private _attachItemEvents(
        root: HTMLDivElement,
        item_props: ContextMenuItemProps,
        input_props: ContextMenuItemInputProps,
        input_node: HTMLInputElement
    ): void {
        const apply = () => {
            setTimeout(() => {
                if (input_props && input_props.type === 'file') {
                    input_node.click();
                    input_node.addEventListener("change", (evt: Event) => {
                        const tgt = (evt.target as HTMLInputElement);

                        const value = tgt.files[0];
                        this._itemClick(item_props, value);
                    });
                }

                const value = input_node ? input_node.value : undefined;

                this.clear();

                if (!(input_props && input_props.type === 'file')) {
                    this._itemClick(item_props, value);
                }
            }, 100);
        }

        if (input_props && input_props.type !== 'file') {
            input_node.addEventListener("keyup", (event) => {
                if (event.keyCode === 13) {
                    apply();
                }
            })
        }

        root.addEventListener('mousedown', (evt) => {
            const tgt = (evt.target as HTMLElement);

            if (tgt.classList.contains(ContextMenu.ItemInputClass)) return;

            root.classList.add(ContextMenu.ItemAcceptedClass);

            apply();
        });
    }

    /**
     * Call handler for 'context menu items click' event
     *
     * @param item_props    properties of the menu item clicked
     * @param value         current input field value
     */
    private _itemClick(item_props: ContextMenuItemProps, value: number|string|boolean|File|void): void {
        let as = item_props.as;

        let alias = as && as.alias ? as.alias : item_props.alias;

        if (as && as.beforeClick) {
            value = as.beforeClick(value);
        }

        this._itemclick(this._caller_id, alias, value);
    }
}