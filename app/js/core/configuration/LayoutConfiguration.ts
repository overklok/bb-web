import {PaneOrientation} from "../layout/types";
import {IConfiguration} from "../helpers/IConfiguration";
import {ViewConfiguration} from "./ViewConfiguration";
import {View} from "../ui/View";

const UNITS_ALLOWED = [
    "px", '%'
];

/**
 * Модель панели разметки
 *
 * Панель является основообразующим элементом разметки.
 * Панель является одновременно самым высокоуровневым и низкоуровневым элементом разметки,
 * так как может содержать в себе другие панели, т.е. эта модель является рекурсивной.
 */
export interface ILayoutPane {
    name: string;
    size: number;
    size_min: number;
    size_max: number;
    size_unit: string;
    fixed: number;
    resizable: boolean;
    panes: ILayoutPane[];
    view_aliases: string[];
    view_types: typeof View[];
}

/**
 * Режим разметки
 *
 * Режим определяет состояние разметки в определённый момент времени.
 * За счёт возможности переключения режимов разметка является динамической.
 */
export interface ILayoutMode {
    panes: ILayoutPane[];
    policy: PaneOrientation;
}

/**
 * Конфигурация разметки
 *
 * @property modes {} режимы разметки
 */
export class LayoutConfiguration implements IConfiguration {
    modes: {[key: string]: ILayoutMode};

    constructor(config: object) {
        this.modes = {};

        for (const [mode_name, mode] of Object.entries(config)) {
            this.modes[mode_name] = <ILayoutMode>mode;
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

    resolveViewAliasesToTypes(view_config: ViewConfiguration) {
        for (const mode of Object.values(this.modes)) {
            for (const pane of mode.panes) {
                this.resolvePaneViewAliasesToTypes(pane, view_config);
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

        this.processPaneSize(pane);
        this.processPaneLimits(pane);
        this.processPaneResizability(pane);
        this.processPaneViews(pane);
    }

    resolvePaneViewAliasesToTypes(pane: ILayoutPane, view_config: ViewConfiguration) {
        // Выполнить перебор вложенных панелей (головная рекурсия)
        if (pane.panes) {
            for (const subpane of pane.panes) {
                this.resolvePaneViewAliasesToTypes(subpane, view_config);
            }
        }

        for (let alias of pane.view_aliases) {
            const view_type = view_config.views[alias];

            if (!view_type) throw new Error(`View type '${alias}' does not exist`);

            pane.view_types.push(view_type);
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
        if (pane.view_aliases && pane.panes) {
            throw new Error(`Only one of 'view_aliases' or 'panes' can be used for pane '${pane.name}'`);
        }

        if (pane.view_aliases) {
            if (!Array.isArray(pane.view_aliases)) {
                throw new Error(`Invalid type of 'view_aliases' for pane '${pane.name}'`);
            }

            // TODO validate item types
        } else {
            pane.view_aliases = [];
        }

        // Создать пустой массив, чтобы в него вопследствии резолвить типы на основе алиасов
        pane.view_types = [];
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