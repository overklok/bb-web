import Application from "../Application";
import ViewConnector from "../base/ViewConnector";
import Model from "../base/Model";
import {ILayoutMode, ILayoutPane, IWidget, ViewOption} from "../views/layout/Layout";

const UNITS_ALLOWED = [
    "px", '%'
];

export type ViewOptionRaw = {alias: string, label: string};


/**
 * Модель разметки
 *
 * @property modes {} режимы разметки
 */
export class LayoutModel extends Model {
    widgets: {[key: string]: IWidget} = {};
    modes: {[key: string]: ILayoutMode};

    constructor(state_initial: {modes: {[key: string]: ILayoutMode}, widgets: {[key: string]: IWidget}}) {
        super();
        const {modes: modes_raw, widgets: widgets_raw} = state_initial;

        for (const [mode_name, mode] of Object.entries(modes_raw)) {
            this.modes[mode_name] = <ILayoutMode>mode;
        }

        for (const [widget_name, widget] of Object.entries(widgets_raw)) {
            this.widgets[widget_name] = <IWidget>widget;
        }
    }

    /**
     * Выполнить предварительную обработку конфигурации разметки
     *
     * В даном случае выполняется проверка правильности составленного объекта
     */
    preprocess(): void {
        for (const mode of Object.values(this.modes)) {
            for (const pane of mode.panes) {
                this.preprocessPane(pane);
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
    preprocessPane(pane: ILayoutPane): void {
        // Выполнить перебор вложенных панелей (головная рекурсия)
        if (pane.panes) {
            for (const subpane of pane.panes) {
                this.preprocessPane(subpane);
            }
        }

        this.processPaneTitle(pane);
        this.processPaneSize(pane);
        this.processPaneLimits(pane);
        this.processPaneResizability(pane);
        this.processPaneViews(pane);
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
    processPaneSize(pane: ILayoutPane): void {
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
    }

    processPaneLimits(pane: ILayoutPane): void {
        if (pane.fixed) {
            pane.size_min = pane.fixed;
            pane.size_max = pane.fixed;
        }

        pane.size_min = this.processSizeLimitValue(pane.size_min);
        pane.size_max = this.processSizeLimitValue(pane.size_max);
    }

    processPaneResizability(pane: ILayoutPane): void {
        if (pane.resizable == null) {
            pane.resizable = true;
        }

        if (pane.size_min == pane.size_max && pane.size_max != null) {
            pane.resizable = false;
        }
    }

    processPaneViews(pane: ILayoutPane): void {
        if (pane.views && pane.panes) {
            throw new Error(`Only one of 'view_aliases' or 'panes' can be used for pane '${pane.name}'`);
        }

        if (pane.views) {
            if (!Array.isArray(pane.views)) {
                throw new Error(`Invalid type of 'view_aliases' for pane '${pane.name}'`);
            }

            // TODO validate item types
        } else {
            pane.views = [];
        }

        // Создать пустой массив, чтобы в него вопследствии резолвить типы на основе алиасов
        pane.view_options = [];
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