import * as React from "react";
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import Pane, {PaneOrientation} from "./Pane";

import {RefObject} from "react";
import {IViewOptions, IViewProps, IViewState, View} from "../../base/view/View";
import {Widget} from "../../services/interfaces/IViewService";
import {WidgetInfo} from "../../helpers/types";
import {ViewEvent} from "../../base/Event";

require('../../../../../app/css/layout.less');

export class LayoutMountEvent extends ViewEvent<LayoutMountEvent> {}

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
    size?: string;
    size_min: string;
    size_max: string;
    resizable: boolean;
    panes: ILayoutPane[];
    widgets: WidgetInfo[];

    _widgets?: Widget<any>[];
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
export default class LayoutView extends View<IViewOptions, ILayoutState> {
    private mounted: boolean;
    private pane_ref: RefObject<Pane> = React.createRef();
    private modes: {[key: string]: ILayoutMode};

    private root_ref: RefObject<HTMLDivElement> = React.createRef();
    private overlay_node: HTMLDivElement;

    constructor(props: IViewProps<IViewOptions>) {
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

        this.overlay_node = document.createElement('div');
        this.overlay_node.classList.add('layout-overlay');

        window.addEventListener('resize', this.onResize());
    }

    public setModes(modes: {[key: string]: ILayoutMode}) {
        if (!modes) return;
        this.modes = this.resolveWidgets(modes);

        if (this.mounted) {
            this.setState({});
        }
    }

    /**
     * Установить режим разметки
     *
     * @param mode название режима разметки из конфигурации
     */
    public setMode(mode: string) {
        this.setState({
            mode_name: mode
        });
    }

    public render() {
        super.render();

        const orientation = this.modes[this.state.mode_name].policy;

        const panes = this.modes[this.state.mode_name].panes;

        return (
            <div ref={this.root_ref} className='layout'>
                <DndProvider backend={HTML5Backend}>
                    <Pane is_root={true}
                          panes={panes}
                          name='root'
                          title='root'
                          orientation={orientation}
                          ref={this.pane_ref}
                          overlay_node={this.overlay_node}
                    />
                </DndProvider>
            </div>
        );
    }

    protected viewDidMount() {
        this.mounted = true;

        this.root_ref.current.appendChild(this.overlay_node);

        this.emit(new LayoutMountEvent({}));
    }

    protected viewWillUnmount() {
        this.mounted = false;

        this.root_ref.current.removeChild(this.overlay_node);
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
                const widget = Object.assign({}, this.props.widgets[alias]);

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