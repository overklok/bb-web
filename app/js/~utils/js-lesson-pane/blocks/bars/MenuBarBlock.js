import BarBlock from "../../core/blocks/BarBlock";
import MenuBarItemBlock from "./MenuBarItemBlock";

import thm from "../../styles/bars/menu-bar/menu-bar.css";

class MenuBarBlock extends BarBlock {
    static get ClassDOM() {return "menu-bar"}

    constructor() {
        super();

        this._menu_items = {};
    }

    include(dom_node) {
        super.include(dom_node);
    }

    setStructure(items) {
        this._removeItems();

        for (let _menu_item_key in items) {
            if (items.hasOwnProperty(_menu_item_key)) {
                this.addMenuItem(items[_menu_item_key]);
            }
        }

        this._menu_items = items;
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
    }
}

export default MenuBarBlock;