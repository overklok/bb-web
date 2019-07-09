import BarBlock from "../../core/blocks/BarBlock";
import MenuBarItemBlock from "./MenuBarItemBlock";

import thm from "../../styles/bars/menu-bar/menu-bar.css";

export default class MenuBarBlock extends BarBlock {
    static get ClassDOM() {return "menu-bar"}

    constructor() {
        super();

        this._menu_items = {};
    }

    include(dom_node) {
        super.include(dom_node);
    }

    setStructure(items_data) {
        this._removeItems();
        this._menu_items = {};

        for (let item_data of items_data) {
            this.addMenuItem(item_data);
        }
    }

    addMenuItem(item_data) {
         let item = new MenuBarItemBlock(
             item_data.name,
             item_data.text,
             item_data.type,
             item_data.handler,
             item_data.right,
             item_data.disabled
         );

         this.addItem(item);
         this._menu_items[item_data.name] = item;
    }

    clickItem(item_name, on) {
        if (!(item_name in this._menu_items)) {
            throw new RangeError(`Item ${item_name} does not exist`);
        }
        this._menu_items[item_name].click(on);
    }
}
