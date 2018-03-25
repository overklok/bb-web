import Block from "../../core/Block";

const SCALE_DURATION = 500; // ms, taken from css

const CONTENT_REDO = `<i class="fas fa-redo"></i>`;
const CONTENT_FF = `<i class="fas fa-fast-forward"></i>`;

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

        this._state.muteNumberChange = false;
        this._state.skidding = false;
        this._state.dispSkidding = false;

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

    setSkiddingDisplay(on=false) {
        this._state.dispSkidding = on;
    }

    setSkidding(on=false) {
        this._state.skidding = on;
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
        };

        this._container.onmouseover = () => {
            this._onMouseOver();
        };

        this._container.onmouseout = () => {
            this._onMouseOut();
        };
    }

    _detachCallbacks() {
        this._container.onclick = undefined;
        this._container.onmouseover = undefined;
        this._container.onmouseover = undefined;
    }

    _onMouseOver() {
        if (!this._state.dispSkidding) {return}

        this._elements.num.classList.remove("animate-hover");
        setTimeout(() => {
            if (!this._state.muteNumberChange) {
                this._elements.num.innerHTML = this._state.skidding ? CONTENT_FF : CONTENT_REDO;
                this._elements.num.classList.add("animate-hover");
            }
        }, SCALE_DURATION)
    }

    _onMouseOut() {
        if (!this._state.dispSkidding) {return}

        this._state.muteNumberChange = true;
        setTimeout(() => {
            this._elements.num.innerHTML = this._number;
            this._state.muteNumberChange = false;
        }, SCALE_DURATION);
    }
}

export default LessonBarLinkBlock;