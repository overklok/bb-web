import Block from "../../core/Block";

class LessonBarLinkBlock extends Block {
    static get ClassDOM() {return "lesson-bar__link"}
    static get ModifierClassesDOM() {return ["progressor"]}

    constructor(number, level_count) {
        super();

        if (level_count === undefined) {throw new TypeError("Lesson bar link must have a level count")}
        if (level_count <= 0) {throw new RangeError("Lesson bar link's level count must be a positive number")}

        this._number = number || 'UNK';
        this._level_count = level_count;

        this._elements = [];

        this._callbacks = {
            onclick: () => {console.warn("Unhandled event 'click' were triggered")}
        }
    }

    include(dom_node) {
        super.include(dom_node);

        this._createElements();
        this._elements.num.innerHTML = this._number;

        this._attachCallbacks();
    }

    setProgress(percent) {
        console.log("PERC", percent);

        this._elements.progressor.style.height = percent + "%";
    }

    dispose() {
        this._detachCallbacks();
    }

    onClick(cb) {
        this._callbacks.onclick = cb;
    }

    /**
     * TODO: Сущность Element
     * @private
     */
    _createElements() {
        this._elements.progressor   = document.createElement("div");
        this._elements.num          = document.createElement("div");

        this._elements.progressor.classList = LessonBarLinkBlock.ClassDOM + "_progressor";
        this._elements.num.classList        = LessonBarLinkBlock.ClassDOM + "_num";

        this._container.appendChild(this._elements.progressor);
        this._container.appendChild(this._elements.num);
    }

    _attachCallbacks() {
        this._container.onclick = () => {
            this._callbacks.onclick();
        }
    }

    _detachCallbacks() {
        this._container.onclick = undefined;
    }
}

export default LessonBarLinkBlock;