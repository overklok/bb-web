import BarItemBlock from "../../core/blocks/BarItemBlock";

import thm from "../../styles/bars/mission-bar/__item/mission-bar__item.css";

class MissionBarItemBlock extends BarItemBlock {
    static get ClassDOM() {return "mission-bar__item"}
    static get ModifierClassesDOM() {return ["leading", "passed"]}

    constructor(text) {
        super();

        this._text = text;
    }

    include(dom_node) {
        super.include(dom_node);

        this._container.innerHTML = this._text;
    }

    setLeading(on=false) {
        this.setModifierBoolean('leading', on);
    }

    displayPassed(on=false) {
        this.setModifierBoolean('passed', on);
    }
}

export default MissionBarItemBlock;