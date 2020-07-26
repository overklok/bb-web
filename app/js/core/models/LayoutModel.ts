import Model from "../base/Model";
import {ILayoutMode, ILayoutPane} from "../views/layout/LayoutView";
import {Widget} from "../services/interfaces/IViewService";

const UNITS_ALLOWED = [
    "px", '%'
];


/**
 * Модель разметки
 *
 * @property modes {} режимы разметки
 */
export class LayoutModel extends Model {
    modes: {[key: string]: ILayoutMode};

    constructor(modes: {[key: string]: ILayoutMode}) {
        super();
        this.modes = Object.assign({}, modes);
        this.preprocess();
    }

    /**
     * Выполнить предварительную обработку конфигурации разметки
     *
     * В даном случае выполняется проверка правильности составленного объекта
     */
    preprocess(): void {
        for (const mode of Object.values(this.modes)) {
            for (const [key, pane] of mode.panes.entries()) {
                mode.panes[key] = this.preprocessPane(pane);
            }
        }
    }

    /**
     * Обработать конфигурацию панели
     *
     * Метод применяется рекурсивно ко всем вложенным панелям.
     *
     * @param pane
     */
    preprocessPane(pane: ILayoutPane): ILayoutPane {
        pane = Object.assign({}, pane);

        // Выполнить перебор вложенных панелей (головная рекурсия)
        if (pane.panes) {
            for (const [key, subpane] of pane.panes.entries()) {
                pane.panes[key] = this.preprocessPane(subpane);
            }
        }

        this.processPaneTitle(pane);
        this.processPaneSize(pane);
        this.processPaneLimits(pane);
        this.processPaneResizability(pane);
        this.processPaneViews(pane);

        return pane;
    }

    processPaneTitle(pane: ILayoutPane): void {
        if (pane.title == null) {
            pane.title = pane.name;
        }
    }

    /**
     * Обработать единицы измерения, заданные в настройках панели
     *
     * Выполняется проверка корректности единиц измерения в полях, отвечающих за
     * размер панелей, а также приведение формата к однозначному виду.
     *
     * Основная задача - разобрать поле size таким образом, чтобы его можно было разложить
     * * на два поля в `ILayoutPane` - size и size_unit - для всех возможных вариантов значений поля size.
     *
     * По умолчанию, если единица измерения не указана, используется вариант `px`.
     * Если единица измерения указана, но её нет в списке доступных, метод выбрасывает исключение.
     *
     * @param pane
     */
    processPaneSize(pane: ILayoutPane): ILayoutPane {
        pane = Object.assign({}, pane);

        let size, size_unit;

        /**
         * Панели с null-размером являются свободными (не имеющими начального размера)
         * Такие панели обрабатывать не нужно.
         */
        if (pane.size == null) return;

        /**
         * Если в поле size задана строка, то это, с большой вероятностью, число с единицей измерения.
         * Если это не так, в качестве единицы измерения принимается `px`.
         */
        if (typeof pane.size === "string") {
            const matches = /^(\d+)(\D+)/gm.exec(pane.size);

            if (matches.length == 3) {
                if (UNITS_ALLOWED.indexOf(matches[2]) == -1) throw new Error(`Invalid size unit: ${matches[2]}`);

                size = Number(matches[1]);
                size_unit = matches[2];
            }
        }

        if (size == null)       size = Number(pane.size);
        if (size_unit == null)  size_unit = "px";

        if (Number.isNaN(size)) size = null;

        [pane.size, pane.size_unit] = [size, size_unit];

        return pane;
    }

    processPaneLimits(pane: ILayoutPane): ILayoutPane {
        pane = Object.assign({}, pane);

        if (pane.fixed) {
            pane.size_min = pane.fixed;
            pane.size_max = pane.fixed;
        }

        pane.size_min = this.processSizeLimitValue(pane.size_min);
        pane.size_max = this.processSizeLimitValue(pane.size_max);

        return pane;
    }

    processPaneResizability(pane: ILayoutPane): ILayoutPane {
        pane = Object.assign({}, pane);

        if (pane.resizable == null) {
            pane.resizable = true;
        }

        if (pane.size_min == pane.size_max && pane.size_max != null) {
            pane.resizable = false;
        }

        return pane;
    }

    processPaneViews(pane: ILayoutPane): ILayoutPane {
        pane = Object.assign({}, pane);

        if (pane.widgets && pane.panes) {
            console.error(pane);
            throw new Error(`Only one of 'widgets' or 'panes' can be used for pane '${pane.name}'`);
        }

        if (pane.widgets) {
            if (!Array.isArray(pane.widgets)) {
                throw new Error(`Invalid type of 'widgets' for pane '${pane.name}'`);
            }

            // TODO validate item types
        } else {
            pane.widgets = [];
        }

        return pane;
    }

    processSizeLimitValue(value: any): number {
        if (value == null) return null;

        if (typeof value === 'string') {
            if (value.slice(-2)) {
                value = value.slice(0, -2);
            }

            value = Number(value);
        }

        if (!Number.isInteger(value)) {
            throw new Error(`Invalid size limit format: ${value}`);
        }

        return value;
    }
}