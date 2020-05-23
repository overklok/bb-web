import * as React from "react";
import {RefObject} from "react";
import classNames from "classnames";
// import ReactCSSTransitionGroup from 'react-transition-group';

import Handle from "./Handle";
import {ILayoutPane} from "../../configuration/LayoutConfiguration";
import {PaneOrientation} from "../types";

/**
 * Свойства панели разметки
 */
interface IProps {
    // уникальное название панели
    name: string,
    // является ли панель корневой в иерархии
    is_root: boolean,
    // внутренние панели
    panes?: ILayoutPane[],

    // ориентация панели
    orientation: PaneOrientation,

    // единица измерения размера панели
    size_unit: string,
    // начальный размер: PX / %
    size: string|number
    // минимальный размер: PX / %
    size_min: number
    // максимальный размер: PX / %
    size_max: number

    // возможно ли изменять размер панели
    resizable: boolean
}

/**
 * Состояние панели разметки
 */
interface IState {
    // текущий размер панели
    size: number,
    // заблокирована ли панель
    locked: boolean
}

// TODO:
// === PoC Completed ===
// 1. [OK] Refactor configuration
// 2. [OK] Add `fixed` shorthand for size_max and size_min
// 3. [OK] Add `resizable` option
// 4. [OK] Refactor Pane
// 5. [OK] Mode switching
// 6. [OK] Animation
// === Base Completed ===
// 8. Add resizing limits (px/%)
// 9. Dynamic Configuration
// 10. Drag & Drop
// 11. Tabs

/**
 * React-компонент "Панель разметки"
 *
 * Панель является основообразующим элементом разметки.
 * Панель может быть ориентирована вертикально или горизонтально.
 * Панель может содержать внутри себя другие панели. При этом их ориентация
 * автоматически определяется как противоположная родительской.
 *
 * Под размером панели следует понимать её высоту или ширину в зависимости от ориентации панели.
 *
 * Для возможности изменения размеров панелей используются вспомогательные компоненты - "Рукоятки".
 * Они располагаются между панелей, для которых возможно изменение размера.
 *
 * @property {RefObject<Pane>[]} список ref-объектов, содержащих вложенный компонент Pane
 * @property {HTMLDivElement} div-элемент компонента Pane в документе
 */
export default class Pane extends React.Component<IProps, IState> {
    static defaultProps = {
        panes: [] as ILayoutPane[],
        name: 'unnamed',
        is_root: false,
        orientation: PaneOrientation.Horizontal,

        size: 0,
        size_unit: '%',

        size_min: 0,
        size_max: 0,

        resizable: true,
    };

    private panes: RefObject<Pane>[] = [];
    private div_element: HTMLDivElement;

    /**
     * Создать объект компонента Pane
     *
     * Выполняется привязка обработчиков к экземпляру, чтобы обработчикам
     * был доступен контекст объекта (this).
     *
     * @param props
     */
    constructor(props: IProps) {
        super(props);

        this.handleDragFinish = this.handleDragFinish.bind(this);
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDragging = this.handleDragging.bind(this);
    }

    /**
     * Выполнить действия после монтажа компонента в документ
     */
    componentDidMount() {
        this.setInitialCss();
    }


    /**
     * Выполнить действия после обновления свойств компонента
     *
     * @param prevProps свойства до обновления
     * @param prevState свойства после обновления
     * @param snapshot  некоторая информация до обновления компонента, определяемая в getSnapshotBeforeUpdate()
     */
    componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any): void {
        this.setInitialCss();
    }

    /**
     * Назначить начальные значения CSS-атрибутов для div-компонента.
     *
     * Этот метод актуализирует выбранные параметры размеров в разметке документа.
     */
    setInitialCss() {
        if (this.is_vertical) {
            this.div_element.style.minHeight    = this.props.size_min ? this.props.size_min + 'px' : null;
        } else {
            this.div_element.style.minWidth     = this.props.size_min ? this.props.size_min + 'px' : null;
        }

        if (this.is_vertical) {
            this.div_element.style.maxHeight    = this.props.size_max ? this.props.size_max + 'px' : null;
        } else {
            this.div_element.style.maxWidth     = this.props.size_max ? this.props.size_max + 'px' : null;
        }

        if (this.props.size == 0) {
            this.div_element.style.width = null;
            this.div_element.style.flexGrow = null;
            return;
        }

        if (this.is_vertical) {
            this.div_element.style.height   = this.props.size ? this.props.size + this.props.size_unit : null;
        } else {
            this.div_element.style.width    = this.props.size ? this.props.size + this.props.size_unit : null;
        }

        this.div_element.style.flexGrow = "0";
    }

    /**
     * Выполнить перерасчёт размеров дочерних панелей
     *
     * Перерасчёт необходим для того, чтобы после ресайза можно было
     * сохранить атрибуты div-элементов дочерних компонентов Pane для сохранения
     * адаптивности при последующем изменении размеров окна.
     */
    recalcChild() {
        let sizes = this.panes.map(
            // Подсчёт размеров без учёта border
            ref => this.is_vertical ?
                ref.current.div_element.clientWidth :
                ref.current.div_element.clientHeight
        );

        let overall_size = sizes.reduce((a, b) => a + b, 0);

        sizes = sizes.map(normalize(0, overall_size));

        for (const [i, ref] of this.panes.entries()) {
            const pane = ref.current;

            if (this.is_vertical) {
                pane.div_element.style.width = sizes[i] * 100 + '%';
            } else {
                pane.div_element.style.height = sizes[i] * 100 + '%';
            }
        }
    }

    /**
     * Сгенерировать дочернюю панель
     *
     * Выполняется перенос всех параметров модели в параметры компонента.
     * Метод записывает по ссылке ref-объект, необходимый для управления дочерней панелью из родительской.
     *
     * @param {number}          index       номер панели (для идентификации React'ом)
     * @param {PaneOrientation} orientation ориентация родительской панели
     * @param {ILayoutPane}     data        модель панели
     * @param {RefObject<Pane>} ref         ref-объект (возврат по ссылке)
     */
    renderPane(index: number, orientation: PaneOrientation, data: ILayoutPane, ref: RefObject<Pane>) {
        return (
            <Pane
                key={data.name || index}
                name={data.name}
                size={data.size}
                size_min={data.size_min}
                size_max={data.size_max}
                size_unit={data.size_unit}
                resizable={data.resizable}
                panes={data.panes}
                orientation={orientation}
                ref={ref}
            />
        );
    }

    /**
     * Сгенерировать рукоятку для панелей
     *
     * Рукоятке передаются номера панелей, между которыми он расположен.
     * Впоследствии эти номера будут передаваться обработчикам событий изменения положения рукоятки
     * в родительской панели.
     *
     * @param {number}          index       номер рукоятки (для идентификации React'ом)
     * @param {PaneOrientation} orientation ориентация родительской панели
     * @param {number}          pane_prev   номер предыдущей панели
     * @param {number}          pane_next   номер следующей панели
     */
    renderHandler(index: number, orientation: PaneOrientation, pane_prev: number, pane_next: number) {
        return (
            <Handle key={`h${index}`} orientation={orientation} pane_prev_num={pane_prev} pane_next_num={pane_next}
                    handleDragStart={this.handleDragStart}
                    handleDragFinish={this.handleDragFinish}
                    handleDragging={this.handleDragging}
            />
        )
    }

    /**
     * Сгенерировать содержимое компонента Pane
     *
     * Pane содержит последовательность дочерних панелей (Pane) и рукояток (Handle) между ними.
     * В атрибут родительской панели `panes` сохраняются ref-объекты (ссылки) на дочерние компоненты.
     * Поэтому панель сама сохраняет в себе ref-объект, чтобы он был доступен
     * её родителю. Благодаря этому родительский компонент может получить ссылку на дочерний при его рендеринге.
     *
     * Дочерние панели ориентированы противоположно родительской.
     * Наличие ркуоятки определяется способностью обеих панелей изменять свой размер.
     */
    render() {
        const orientation = Pane.inverseOrientation(this.props.orientation);

        // Список классов, которые должны использоваться в зависимости от свойств
        let klasses = classNames({
            'root': this.props.is_root,
            'pane': true,
            'pane-h': this.props.orientation == PaneOrientation.Horizontal,
            'pane-v': this.props.orientation == PaneOrientation.Vertical,
            'pane-animated': true,
        });

        // Компоненты, лежащие внутри Pane
        const elements = [];
        this.panes = [];

        for (const [index, pane] of this.props.panes.entries()) {
            const ref: RefObject<Pane> = React.createRef();
            const pane_comp = this.renderPane(index, orientation, pane, ref);
            this.panes.push(ref);

            elements.push(pane_comp);

            if (index !== (this.props.panes.length - 1)) {
                if (pane.resizable && this.props.panes[index+1].resizable) {
                    elements.push(this.renderHandler(index, orientation, index, index + 1));
                }
            }
        }

        return (
            <div className={klasses} ref={div_element => {this.div_element = div_element}}>
                {elements}
            </div>
        );
    }

    /**
     * Обработать событие перетаскивания панели
     *
     * @param {number} movement_px      Количество пикселей, на которое была смещена рукоятка
     * @param {number} pane_prev_num    Номер панели, распологающейся слева/сверху от рукоятки
     * @param {number} pane_next_num    Номер панели, распологающейся справа/снизу от рукоятки
     */
    handleDragging(movement_px: number, pane_prev_num: number, pane_next_num: number) {
        // Панели, которые окружают рукоятку
        const pane_prev = this.panes[pane_prev_num].current;
        const pane_next = this.panes[pane_next_num].current;

        // div-элементы панелей в документе
        const div_prev = pane_prev.div_element;
        const div_next = pane_next.div_element;

        // Старые размеры панелей в процентах
        const size_prev_old_perc = Number((this.is_vertical ? div_prev.style.width : div_prev.style.height).slice(0, -1)),
              size_next_old_perc = Number((this.is_vertical ? div_next.style.width : div_next.style.height).slice(0, -1));

        // Старые размеры панелей в пикселях
        const size_prev_old_px = this.is_vertical ? div_prev.clientWidth : div_prev.clientHeight,
              size_next_old_px = this.is_vertical ? div_next.clientWidth : div_next.clientHeight;

        /*
         * Обнаружен ли овердраг
         *
         * В ситуациях, когда рукоятка не должна следовать за курсором из-за ограничений размеров панелей,
         * необходимо сообщать самой рукоятке, чтобы она переключилась в режим овердрага.
         * В этом режиме она будет неподвижна, и, как следствие, не будет генерировать события перемещения,
         * до тех пор, пока не выполнится условие выхода, которое зависит от значения этой переменной.
         */
        let overdrag = null;

        // Соотношение числа процентов на пиксель (относительно текущего размера окна)
        const ppp = (size_next_old_perc + size_prev_old_perc) / (size_prev_old_px + size_next_old_px);

        // Количество процентов, на которое была смещена рукоятка
        let movement_perc = movement_px * ppp;

        // Проверка минимально допустимого размера следующей за рукояткой панели
        if (size_next_old_px - movement_px <= pane_next.props.size_min) {
            movement_perc = size_next_old_perc - pane_next.props.size_min * ppp;
            overdrag = 1;
        }

        // Проверка минимально допустимого размера предыдущей до рукоятки панели
        if (size_prev_old_px + movement_px <= pane_prev.props.size_min) {
            movement_perc = -(size_prev_old_perc - pane_prev.props.size_min * ppp);
            overdrag = -1;
        }

        // Проверка максимально допустимого размера следующей за рукояткой панели
        if (pane_next.props.size_max && size_next_old_px - movement_px >= pane_next.props.size_max) {
            movement_perc = (size_next_old_perc - pane_next.props.size_max * ppp);
            overdrag = -1;
        }

        // Проверка максимально допустимого размера предыдущей до рукоятки панели
        if (pane_prev.props.size_max && size_prev_old_px + movement_px >= pane_prev.props.size_max) {
            movement_perc = -(size_prev_old_perc - pane_prev.props.size_max * ppp);
            overdrag = 1;
        }

        // Новые предполагаемые размеры панелей
        let size_prev_new = size_prev_old_perc + movement_perc,
            size_next_new = size_next_old_perc - movement_perc;

        if (this.is_vertical) {
            div_prev.style.width = size_prev_new + '%';
            div_next.style.width = size_next_new + '%';
        } else {
            div_prev.style.height = size_prev_new + '%';
            div_next.style.height = size_next_new + '%';
        }

        /*
         * Методу, вызывающему этот обработчик, необходимо сообщить о возможном овердраге,
         * чтобы он мог обрабатывать ситуации, в которых перемещение рукоятки необходимо предотвратить.
         */
        return overdrag;
    }

    /**
     * Обработать событие начала перетаскивания рукоятки
     *
     * Началом перетаскивания считается момент, когда пользователь нажимает левую кнопку мыши
     *
     * @param {number} pane_num_prev Номер панели, распологающейся до рукоятки
     * @param {number} pane_num_next Номер панели, распологающейся после рукоятки
     */
    handleDragStart(pane_num_prev: number, pane_num_next: number) {
        // Отключить анимацию на время перетаскивания
        for (const pane of this.panes) {
            pane.current.div_element.classList.remove('pane-animated');
        }

        this.recalcChild();
    }

    /**
     * Обработать событие конца перетаскивания рукоятки
     *
     * Началом перетаскивания считается момент, когда пользователь отпускает левую кнопку мыши
     *
     * @param {number} pane_num_prev Номер панели, распологающейся до рукоятки
     * @param {number} pane_num_next Номер панели, распологающейся после рукоятки
     */
    handleDragFinish(pane_num_prev: number, pane_num_next: number) {
        // Включить анимацию на время перетаскивания
        for (const pane of this.panes) {
            pane.current.div_element.classList.add('pane-animated');
        }

        this.recalcChild();
    }

    get is_vertical() {
        return this.props.orientation === PaneOrientation.Vertical;
    }

    static inverseOrientation(orientation: PaneOrientation) {
        return orientation === PaneOrientation.Horizontal ? PaneOrientation.Vertical : PaneOrientation.Horizontal;
    }
}

function normalize(min: number, max: number) {
    const delta = max - min;
    return function (val: number) {
        return (val - min) / delta;
    };
}