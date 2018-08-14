import ChipBlock from "../../core/blocks/ChipBlock";

import thm from "../../styles/chips/lesson-chip/lesson-chip.css";

const CLASSES = {
    LOGO: "logo",
    META: "meta",
};

export default class LessonChipBlock extends ChipBlock {
    static get ClassDOM() {return "lesson-chip"}

    constructor() {
        super();

        this._containers = {
            logo: undefined,
            meta: undefined,
        }
    }

    include(dom_node) {
        super.include(dom_node);

        this._containers.logo = document.createElement("div");
        this._containers.meta = document.createElement("div");

        this._containers.logo.classList.add(CLASSES.LOGO);
        this._containers.meta.classList.add(CLASSES.META);

        this._container.appendChild(this._containers.logo);
        this._container.appendChild(this._containers.meta);
    }

    setTextMeta(text) {
        this._containers.meta.innerHTML = `<div class="meta-abs"><p>${text}</p></div>`;
    }

    setTextLogo(text) {
        this._containers.logo.innerHTML = `<p>${text}</p>`;
    }
}