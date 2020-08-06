import Model from "../base/model/Model";
import {ILayoutMode, ILayoutPane} from "../views/layout/LayoutView";
import DummyDatasource from "../base/model/datasources/DummyDatasource";
import {PaneOrientation} from "../views/layout/Pane";
import {WidgetInfo} from "../helpers/types";

const UNITS_ALLOWED = [
    "px", '%'
];

type Widget = {
    alias: string;
    label: string;
}

type Pane = {
    name: string;
    title?: string;
    size_min?: string;
    size_max?: string;
    resizable?: Boolean;
    fixed?: number;
    size?: string;
    widgets?: Widget[];
    panes?: Pane[];
}

type LayoutMode = {
    policy: string;
    panes: Pane[]
}

interface LayoutModelState {
    modes: {[key: string]: LayoutMode};
}

/**
 * Модель разметки
 *
 * @property modes {} режимы разметки
 */
export class LayoutModel extends Model<LayoutModelState, DummyDatasource> {
    init(state: LayoutModelState) {
        this.state = JSON.parse(JSON.stringify(Object.assign({}, state)));
    }

    /**
     * Выполнить предварительную обработку конфигурации разметки
     *
     * В даном случае выполняется проверка правильности составленного объекта
     */
    getFormatted(): {[key: string]: ILayoutMode} {
        let modes_formatted: {[key: string]: ILayoutMode} = {};

        for (const [k, mode] of Object.entries(this.state.modes)) {
            modes_formatted[k] = {
                policy: mode.policy as PaneOrientation,
                panes: []
            }

            for (const [key, pane] of mode.panes.entries()) {
                modes_formatted[k].panes[key] = this.formatPane(pane);
            }
        }

        return modes_formatted;
    }

    /**
     * Обработать конфигурацию панели
     *
     * Метод применяется рекурсивно ко всем вложенным панелям.
     *
     * @param pane
     */
    formatPane(pane: Pane): ILayoutPane {
        let panes = undefined;

        // Выполнить перебор вложенных панелей (головная рекурсия)
        if (pane.panes) {
            panes = [];

            for (const [key, subpane] of pane.panes.entries()) {
                panes[key] = this.formatPane(subpane);
            }
        }

        const title = this.formatPaneTitle(pane);
        const {size, size_unit} = this.formatPaneSize(pane);
        const {size_min, size_max, resizable} = this.formatPaneLimits(pane);
        const widgets = this.formatPaneViews(pane);

        return {
            name: pane.name,
            title,
            size,
            size_unit,
            size_min,
            size_max,
            resizable,
            widgets,
            panes,
        };
    }

    formatPaneTitle(pane: Pane): string {
        return pane.title || pane.name;
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
    formatPaneSize(pane: Pane): { size: number, size_unit: string } {
        let size, size_unit;

        /**
         * Панели с null-размером являются свободными (не имеющими начального размера)
         * Такие панели обрабатывать не нужно.
         */
        if (pane.size == null) return {size: 0, size_unit: null};

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

        return {size, size_unit};
    }

    formatPaneLimits(pane: Pane): {size_min: number, size_max: number, resizable: boolean} {
        let resizable, size_min, size_max;

        size_min = pane.fixed ? pane.fixed : pane.size_min;
        size_max = pane.fixed ? pane.fixed : pane.size_max;

        size_min = this.formatSizeLimitValue(size_min);
        size_max = this.formatSizeLimitValue(size_max);

        if (pane.resizable == null) {
            resizable = true;
        }

        if (size_min == size_max && size_max != null) {
            resizable = false;
        }

        return {size_min, size_max, resizable};
    }

    formatPaneViews(pane: Pane): WidgetInfo[] {
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
            return [];
        }

        return pane.widgets;
    }

    formatSizeLimitValue(value: any): number {
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