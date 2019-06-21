import Current from "./Current"

/**
 * Класс "Вспомогательный ток"
 */
export default class AuxiliaryCurrent extends Current {
    constructor(container, points, style) {
        super();

        this.__aux = false;
        this._points = undefined;
    }

    /**
     * Проверить, совпадает ли контур у тока
     *
     * @param {Object} thread контур
     * @returns {boolean}
     */
    hasSameThread(thread) {
        return false;
    }
}