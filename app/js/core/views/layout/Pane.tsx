import {CSSTransition, Transition, TransitionGroup} from 'react-transition-group';

import * as React from "react";
import {RefObject} from "react";
import classNames from "classnames";

import Handle from "./Handle";
import {IViewOptions, View} from "../../base/view/View";
import Nest from "../../base/view/Nest";
import Frame from "./Frame";
import TabViewComposer from "../../base/view/viewcomposers/tab/TabViewComposer";
import Cover from "./Cover";
import {ILayoutPane} from "./LayoutView";
import {Widget} from "../../services/interfaces/IViewService";
import OverlayViewComposer from "../../base/view/viewcomposers/OverlayViewComposer";

export enum PaneOrientation {
    Vertical = 'vertical',
    Horizontal = 'horizontal'
}

/**
 * Свойства панели разметки
 */
interface IProps {
    // уникальное название панели
    name: string;
    // заголовок панели
    title: string;
    // является ли панель корневой в иерархии
    is_root: boolean;
    // внутренние панели
    panes?: ILayoutPane[];
    // варианты Видов
    _widgets?: Widget<any>[];
    // композитор Видов
    composer?: string;

    // ориентация панели
    orientation: PaneOrientation;

    // начальный размер: PX / %
    size: string;
    // минимальный размер: PX / %
    size_min: string;
    // максимальный размер: PX / %
    size_max: string;

    // возможно ли изменять размер панели
    resizable: boolean;

    // прикрыта ли панель (изначально)
    covered: boolean;

    show_headers?: boolean;

    overlay_node?: HTMLElement;
}

/**
 * Состояние панели разметки
 */
interface IState {
    // прикрыта ли панель
    covered: boolean;
    // анимирована ли панель
    animated: boolean;
}

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
 * TODO: Calculate size_unit here, pass to class attributes. Same for size_min and size_max
 *
 * @property {RefObject<Pane>[]} список ref-объектов, содержащих вложенный компонент Pane
 * @property {HTMLDivElement} div-элемент компонента Pane в документе
 */
export default class Pane extends React.Component<IProps, IState> {
    static defaultProps = {
        panes: [] as ILayoutPane[],
        view_aliases: [] as string[],
        view_types: [] as typeof View[],
        composer: 'tab',

        name: 'unnamed',
        is_root: false,
        orientation: PaneOrientation.Horizontal,

        size: '0px',

        size_min: '0px',
        size_max: '0px',

        resizable: true,
        covered: false,

        show_headers: true,
    };

    private panes: RefObject<Pane>[] = [];
    private nests: RefObject<Nest>[] = [];
    private div_element: HTMLDivElement;

    public size: number;
    public size_min: number;
    public size_max: number;

    public size_unit: string;
    public size_min_unit: string;
    public size_max_unit: string;

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

        this.state = {
            covered: this.props.covered,
            animated: true,
        };

        this.parseSizes();
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
        if (this.props.covered !== prevProps.covered) {
            this.setState({covered: this.props.covered, animated: this.state.animated})
        }

        if (this.props.panes !== prevProps.panes) {
            this.setInitialCss();
        }

        this.parseSizes();
        this.setInitialCssChild();
    }

    /**
     * Выполнить действия перед "входом" элемента
     *
     * Метод вызывается в тот момент, когда к элементу добавлен CSS-класс начала анимации входа.
     */
    childWillEnter() {
        // Перед входом нужно убедиться, что размеры дочерних панели соответствуют конфигурации.
        // Класс начала анимации входа задаёт панели нулевой размер, и к завершению входа этот класс будет убран.
        // Поскольку у свободных элементов размер вычисляется через flex, они не будут развёрнуты, если не вызывать
        // эту функцию.
        // this.setInitialCssChild();
    }

    /**
     * Выполнить действия после "входа" элемента
     *
     * Метод вызывается в тот момент, когда к элементу добавлен CSS-класс окончания анимации входа.
     */
    childDidEnter() {
        // this.setInitialCss();
        // this.notifyResizePanes();
    }

    /**
     * Выполнить действия перед "уходом" элемента
     *
     * Метод вызывается в тот момент, когда к элементу добавлен CSS-класс начала анимации выхода.
     */
    childWillLeave() {
        // Для применения эффекта выхода необходимо заново рассчитать размеры дочерних панелей на
        // основе новых (нулевых) значений CSS-атрибутов панелей, которые будут удалены.
        // this.recalcChild();
    }

    childDidLeave() {
        this.notifyResizePanes();
    }

    parseSizes() {
        [this.size, this.size_unit]         = parseSize(this.props.size);
        [this.size_min, this.size_min_unit] = parseSize(this.props.size_min);
        [this.size_max, this.size_max_unit] = parseSize(this.props.size_max);
    }

    /**
     * Назначить начальные значения CSS-атрибутов для div-компонента.
     *
     * Этот метод актуализирует выбранные параметры размеров в разметке документа.
     */
    setInitialCss() {
        if (this.div_element == null) return;

        // Обнулить прежние возможные правила элемента
        this.div_element.style.minHeight    = null;
        this.div_element.style.minWidth     = null;
        this.div_element.style.maxHeight    = null;
        this.div_element.style.maxWidth     = null;
        this.div_element.style.flexBasis    = null;

        if (this.is_vertical) {
            this.div_element.style.minHeight    = this.size_min ? this.size_min + this.size_min_unit : null;
        } else {
            this.div_element.style.minWidth     = this.size_min ? this.size_min + this.size_min_unit : null;
        }

        if (this.is_vertical) {
            this.div_element.style.maxHeight    = this.size_max ? this.size_max + this.size_max_unit : null;
        } else {
            this.div_element.style.maxWidth     = this.size_max ? this.size_max + this.size_max_unit: null;
        }

        if (this.size == 0) {
            this.div_element.style.flexBasis = "0";
            this.div_element.style.flexGrow = null;
            return;
        }

        this.div_element.style.flexBasis = this.size ? this.size + this.size_unit : null;

        this.div_element.style.flexGrow = "1";
    }

    setInitialCssChild() {
        for (const ref of this.panes) {
            const pane = ref.current;

            if (pane) {
                pane.setInitialCss();
            }
        }
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

            pane.div_element.style.flexBasis = sizes[i] * 100 + '%';
        }
    }

    notifyResizePanes() {
        for (const pane of this.panes) {
            if (pane.current) {
                pane.current.notifyResizePanes();
            }
        }

        for (const nest of this.nests) {
            if (nest.current) {
                nest.current.notifyResizeView();
            }
        }
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
            'pane_noselect': false,
            'pane_animated': this.state.animated,
            'pane-sizemin': this.props.size_min,
            'pane-sizemax': this.props.size_max,
        });

        // Компоненты, лежащие внутри Pane
        let components;

        // Очистить панели, чтобы исключить ложные ссылки
        this.panes = [];

        if (this.props.panes.length > 0) {
            components = this.renderPanes(this.props.panes, orientation);
        } else {
            components = this.renderNests();
        }

        return (
            <div className={klasses} ref={div_element => {this.div_element = div_element}}>
                {/*Показывать обложку для панели, если в ней нет вложенных панелей*/}
                <Cover enabled={!this.panes.length && this.state.covered}
                       title={this.props.title}
                />
                {components}
            </div>
        );
    }

    private renderPanes(panes: ILayoutPane[], orientation: PaneOrientation) {
        let elements = [];

        for (const [index, pane] of panes.entries()) {
            const ref: RefObject<Pane> = React.createRef();
            const pane_comp = this.renderPane(index, orientation, pane, ref);
            this.panes.push(ref);

            elements.push(pane_comp);

            if (index !== (panes.length - 1)) {
                if (pane.resizable && panes[index+1].resizable) {
                    elements.push(this.renderHandler(index, orientation, index, index + 1));
                }
            }
        }

        return (
            <TransitionGroup component={null}>
                {elements}
            </TransitionGroup>
        );
    }

    private renderNests() {
        this.nests = [];

        if (!this.props._widgets) return null;

        const overlay_node = this.props.overlay_node;

        if (this.props.composer === 'overlay') {
            return (
                <Frame covered={this.state.covered}>
                    <OverlayViewComposer>
                        {this.props._widgets.map((widget, index) => {
                            const ref: RefObject<Nest> = React.createRef();

                            const nest = this.renderNest(index, widget, ref);
                            this.nests.push(ref);

                            return nest;
                        })}
                    </OverlayViewComposer>
                </Frame>
            )
        }

        return (
            <Frame covered={this.state.covered}>
                <TabViewComposer overlay_node={overlay_node} show_headers={this.props.show_headers}>
                    {this.props._widgets.map((widget, index) => {
                        const ref: RefObject<Nest> = React.createRef();

                        const nest = this.renderNest(index, widget, ref);
                        this.nests.push(ref);

                        return nest;
                    })}
                </TabViewComposer>
            </Frame>
        )
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
    renderPane(index: number, orientation: PaneOrientation, data: ILayoutPane, ref: RefObject<Pane>): JSX.Element {
        return (
            <CSSTransition
                timeout={600}
                key={'t' + (data.name || index)}
                classNames="pane"

                onEntering={() => this.childWillEnter()}
                onEntered={() => this.childDidEnter()}
                onExiting={() => this.childWillLeave()}
                onExited={() => this.childDidLeave()}
            >
                <Pane
                    key={data.name || index}
                    name={data.name}
                    title={data.title}
                    size={data.size}
                    size_min={data.size_min}
                    size_max={data.size_max}
                    resizable={data.resizable}
                    panes={data.panes}
                    composer={data.composer}
                    orientation={orientation}
                    _widgets={data._widgets}
                    covered={this.state.covered}
                    ref={ref}
                    overlay_node={this.props.overlay_node}
                    show_headers={this.props.show_headers}
                />
            </CSSTransition>
        );
    }

    renderNest(index: number, widget: Widget<any>, ref: RefObject<Nest>): JSX.Element {
        return (
            <Nest
                key={index}
                index={index}
                view_type={widget.view_type}
                view_options={widget.view_options}
                connector={widget.connector}
                label={widget.label}
                ref={ref}
            />
        )
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
            <CSSTransition key={`ht${index}`} timeout={0}>
                <Handle key={`h${index}`} orientation={orientation} pane_prev_num={pane_prev} pane_next_num={pane_next}
                        handleDragStart={this.handleDragStart}
                        handleDragFinish={this.handleDragFinish}
                        handleDragging={this.handleDragging}
                />
            </CSSTransition>
        )
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
        const size_prev_old_perc = Number((div_prev.style.flexBasis).slice(0, -1)),
              size_next_old_perc = Number((div_next.style.flexBasis).slice(0, -1));

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

        pane_prev.size_min = 12;

        const size_min_absolute_prev = pane_prev.size_min_unit === '%' ? pane_prev.size_min * ppp : pane_prev.size_min,
              size_min_absolute_next = pane_next.size_min_unit === '%' ? pane_next.size_min * ppp : pane_next.size_min,
              size_max_absolute_prev = pane_prev.size_max_unit === '%' ? pane_prev.size_max * ppp : pane_prev.size_max,
              size_max_absolute_next = pane_next.size_max_unit === '%' ? pane_next.size_max * ppp : pane_next.size_max;

        // Проверка минимально допустимого размера следующей за рукояткой панели
        if (size_next_old_px - movement_px <= size_min_absolute_next) {
            movement_perc = size_next_old_perc - size_min_absolute_next * ppp;
            overdrag = 1;
        }

        // Проверка минимально допустимого размера предыдущей до рукоятки панели
        if (size_prev_old_px + movement_px <= size_min_absolute_prev) {
            movement_perc = -(size_prev_old_perc - size_min_absolute_prev * ppp);
            overdrag = -1;
        }

        // Проверка максимально допустимого размера следующей за рукояткой панели
        if (pane_next.props.size_max && size_next_old_px - movement_px >= size_max_absolute_next) {
            movement_perc = (size_next_old_perc - size_max_absolute_next * ppp);
            overdrag = -1;
        }

        // Проверка максимально допустимого размера предыдущей до рукоятки панели
        if (pane_prev.props.size_max && size_prev_old_px + movement_px >= size_max_absolute_prev) {
            movement_perc = -(size_prev_old_perc - size_max_absolute_prev * ppp);
            overdrag = 1;
        }

        // Новые предполагаемые размеры панелей
        let size_prev_new = size_prev_old_perc + movement_perc,
            size_next_new = size_next_old_perc - movement_perc;

        div_prev.style.flexBasis = size_prev_new + '%';
        div_next.style.flexBasis = size_next_new + '%';

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
        this.panes[pane_num_prev].current.setState({animated: false, covered: false})
        this.panes[pane_num_next].current.setState({animated: false, covered: false})

        // Отключить анимацию на время перетаскивания
        for (const pane of this.panes) {
            pane.current.div_element.classList.add('pane_noselect');
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
        this.panes[pane_num_prev].current.setState({animated: true, covered: false})
        this.panes[pane_num_next].current.setState({animated: true, covered: false})

        // Включить анимацию на время перетаскивания
        for (const pane of this.panes) {
            pane.current.div_element.classList.remove('pane_noselect');
        }

        this.recalcChild();
        this.notifyResizePanes();
    }

    get is_vertical() {
        return this.props.orientation === PaneOrientation.Vertical;
    }

    static inverseOrientation(orientation: PaneOrientation) {
        return orientation === PaneOrientation.Horizontal ? PaneOrientation.Vertical : PaneOrientation.Horizontal;
    }
}

function parseSize(value: string): [number, string] {
    if (!value) return [0, 'px'];

    const unit = value.slice(-1) === '%' ? '%' : 'px';
    const size = Number(value.slice(0, -unit.length));

    return [size, unit];
}

function normalize(min: number, max: number) {
    const delta = max - min;
    return function (val: number) {
        return (val - min) / delta;
    };
}