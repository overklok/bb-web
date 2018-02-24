import Wrapper from "../core/Wrapper";

const SELECTORS = {
    MAIN: ".spinner",
    TEXT: ".spinner__text"
};

const CLASSES = {
    TEXT_ERROR: "spinner__text_error"
};

const SPINNER_HIDE_DURATION = 500;

class SpinnerWrapper extends Wrapper {
    constructor() {
        super();

        this._removed = false;
    }

    setTextInfo(text) {
        if (!this._removed) {
            $(SELECTORS.TEXT).removeClass("spinner__text_error");
            $(SELECTORS.TEXT).html(text);
        }
    }

    setTextError(text) {
        if (!this._removed) {
            $(SELECTORS.TEXT).addClass("spinner__text_error");
            $(SELECTORS.TEXT).html(text);
        }
    }

    hide() {
        return new Promise(resolve => {
            /// Если уже удалён, завершить операцию
            if (this._removed) {
                resolve();
                return;
            }

            /// Эффект исчезновения
            $(SELECTORS.MAIN).css({opacity: 0, transform: "scale(0.8)"});

            /// Задержка для отображения анимации исчезновения
            setTimeout(() => {
                /// Удалить элемент
                $(SELECTORS.MAIN).remove();
                /// Установить флаг
                this._removed = true;

                /// Завершить операцию
                resolve();
            }, SPINNER_HIDE_DURATION);
        });
    }
}

export default SpinnerWrapper