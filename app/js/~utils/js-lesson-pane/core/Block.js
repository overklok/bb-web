class Block {
    static get ClassDOM()           {return undefined}
    static get ModifierClassesDOM() {return []}
    static get ParametersRequired() {return ["className"]}

    constructor() {
        this._container = undefined;
        this._callbacks = undefined;
        this._elements  = undefined;

        this._params = {
            className: this.constructor.ClassDOM,
            modifierClassNames: this.constructor.ModifierClassesDOM
        };

        this._state = {
            included: false,
        }
    }

    include(dom_node) {
        if (!dom_node) {throw new TypeError("DOM Node is not defined")}
        if (this._state.included) {throw new Error("This block has been included already")}

        this._checkParams();

        dom_node.classList += " " + this._params.className;

        this._container = dom_node;

        this._state.included = true;
    }

    setModifierBoolean(class_name, value) {
        if (this._params.modifierClassNames.indexOf(class_name) === -1) {
            throw new RangeError(`Modifier '${class_name}' is not applicable for this block`);
        }

        let class_name_full = this._params.className + '_' + class_name;

        if (value) {
            this._container.classList.remove(class_name_full);
            this._container.classList.add(class_name_full);
        } else {
            this._container.classList.remove(class_name_full);
        }
    }

    /**
     *
     * @param {Block} item
     */
    addItem(item) {
        if (!(item instanceof Block)) {throw new TypeError("Item is not an instance of Block")}
        if (!this._state.included) {throw new TypeError("Block must be included before performing this")}

        this._includeItem(item);

        this._items.push(item);
    }

    clearItems() {
        if (!this._state.included) {throw new TypeError("Block must be included before performing this")}

        this._removeItems();
    }

    dispose() {
        if (!this._state.included) {throw new TypeError("Block must be included before performing this")}

        this._container.remove();
    }

    /**
     *
     * @param {Block} item
     * @private
     */
    _includeItem(item) {
        if (!item) {throw new TypeError("Item is not defined")}

        let item_container = document.createElement("div");
        this._container.appendChild(item_container);

        item.include(item_container);
    }

    _removeItems() {
        for (let item of this._items) {
            item.dispose();
        }

        this._items = [];
    }

    _checkParams() {
        if (!this._params) {throw new TypeError("Block._params is not defined")}

        let param_ids = Object.keys(this._params);

        for (let param_required_id of Block.ParametersRequired) {
            if (param_ids.indexOf(param_required_id) === -1) {
                throw new TypeError(`Block._params must define '${param_required_id}'`);
            }

            if (typeof this._params[param_required_id] === "undefined") {
                throw new TypeError(`Block._params must define the value of '${param_required_id}'`);
            }
        }
    }
}

export default Block;