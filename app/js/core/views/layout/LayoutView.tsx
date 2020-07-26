import * as React from "react";
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import Pane, {PaneOrientation} from "./Pane";

import {RefObject} from "react";
import {IViewProps, IViewState, View} from "../../base/View";
import {Widget} from "../../services/interfaces/IViewService";
import {WidgetInfo} from "../../helpers/types";

require('../../../../../app/css/layout.less');

export enum DraggableItemTypes {
    Tab = 'tab'
}

/**
 * Модель панели разметки
 *
 * Панель является основообразующим элементом разметки.
 * Панель является одновременно самым высокоуровневым и низкоуровневым элементом разметки,
 * так как может содержать в себе другие панели, т.е. эта модель является рекурсивной.
 */
export interface ILayoutPane {
    name: string;
    title: string;
    size: number;
    size_min: number;
    size_max: number;
    size_unit: string;
    fixed: number;
    resizable: boolean;
    panes: ILayoutPane[];
    widgets: WidgetInfo[];

    _widgets: Widget[];
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
 * Свойства разметки
 */
interface ILayoutProps extends IViewProps {
    // конифгурация режимов разметки
    // modes: {[key: string]: ILayoutMode};
}

/**
 * Состояние разметки
 */
interface ILayoutState extends IViewState {
    // название текущего режима разметки
    mode_name: string
}

/**
 * React-компонент "Разметка"
 *
 * Разметка определяет расположение внутренних модулей приложения,
 * компонуя панели в соответствии с выбранным режимом разметки.
 * Режимы разметки задаются в конфигурационном объекте `LayoutConfig`.
 */
export default class LayoutView extends View<ILayoutProps, ILayoutState> {
    private mounted: boolean;
    private pane_ref: RefObject<Pane> = React.createRef();
    private modes: {[key: string]: ILayoutMode};

    constructor(props: ILayoutProps) {
        super(props);

        this.modes = {
            default: {
                policy: PaneOrientation.Horizontal,
                panes: [] as ILayoutPane[]
            }
        };

        this.mounted = false;

        this.state = {
            mode_name: 'default'
        }

        window.addEventListener('resize', this.onResize());

        console.log('oneview');
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    setModes(modes: {[key: string]: ILayoutMode}) {
        if (!modes) return;
        this.modes = this.resolveWidgets(modes);

        if (this.mounted) {
            this.setState({});
        }

        console.log(this.modes);
    }

    /**
     * Установить режим разметки
     *
     * @param mode название режима разметки из конфигурации
     */
    setMode(mode: string) {
        this.setState({
            mode_name: mode
        });
    }

    render() {
        console.log(this.modes);

        const orientation = this.modes[this.state.mode_name].policy;

        const panes = this.modes[this.state.mode_name].panes;

        return (
            <DndProvider backend={HTML5Backend}>
                <Pane is_root={true}
                      panes={panes}
                      name='root'
                      title='root'
                      orientation={orientation}
                      ref={this.pane_ref}
                />
            </DndProvider>
        );
    }

    private resolveWidgets(modes: {[key: string]: ILayoutMode}): {[key: string]: ILayoutMode} {
        for (const mode of Object.values(modes)) {
            for (const pane of mode.panes) {
                this.resolvePaneWidgets(pane);
            }
        }

        return modes;
    }

    private resolvePaneWidgets(pane: ILayoutPane) {
        // Выполнить перебор вложенных панелей (головная рекурсия)
        if (pane.panes) {
            for (const subpane of pane.panes) {
                this.resolvePaneWidgets(subpane);
            }

            // если в панели лежат другие панели, то дальше обрабатывать не имеет смысла
            return;
        }

        if (this.props.widgets && pane.widgets) {
            // если в панели не лежат другие панели, то в ней могут быть виджеты

            pane._widgets = [];

            for (let {alias, label} of pane.widgets) {
                if (!(alias in this.props.widgets)) {
                    throw new Error(`Cannot resolve widget by alias ${alias}`)
                }
                const widget = this.props.widgets[alias];

                // замеить надпись виджета, если она переопределена
                widget.label = label || widget.label;

                pane._widgets.push(widget);
            }
        }
    }

    private onResize() {
        let doit: number;

        // throttle
        return () => {
            clearTimeout(doit);
            doit = window.setTimeout(() => this.notifyResizePane(), 100);
        }
    }

    private notifyResizePane() {
        if (this.pane_ref.current) {
            this.pane_ref.current.notifyResizePanes();
        }
    }
}