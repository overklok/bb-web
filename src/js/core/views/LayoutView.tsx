import * as React from "react";
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import Pane, {PaneOrientation} from "./layout/Pane";

import {RefObject} from "react";
import {AllProps, IViewProps, IViewState, View} from "../base/view/View";
import {Widget} from "../services/interfaces/IViewService";
import {WidgetInfo} from "../helpers/types";
import {ViewEvent} from "../base/Event";

require('../../../css/core/layout.less');

export class LayoutMountEvent extends ViewEvent<LayoutMountEvent> {}
export class LayoutFinishedEvent extends ViewEvent<LayoutFinishedEvent> {
    mode_name: string;
}

export enum DraggableItemTypes {
    Tab = 'tab'
}

/**
 * Модель панели разметки
 *
 * Панель является основообразующим элементом разметки.
 * Панель является одновременно самым высокоуровневым и низкоуровневым элементом разметки,
 * так как может содержать в себе другие панели, т.е. эта модель является рекурсивной.
 * 
 * @category Core.Views
 * @subcategory DataObjects
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
    composer: string;

    _widgets?: Widget<any>[];
}

/**
 * Режим разметки
 *
 * Режим определяет состояние разметки в определённый момент времени.
 * За счёт возможности переключения режимов разметка является динамической.
 * 
 * @category Core.Views
 * @subcategory DataObjects
 */
export interface ILayoutMode {
    panes: ILayoutPane[];
    policy: PaneOrientation;
}

/**
 * Состояние разметки
 * 
 * @category Core.Views
 */
interface LayoutState extends IViewState {
    // название текущего режима разметки
    mode_name: string;
}

/**
 * @category Core.Views
 */
interface LayoutProps extends IViewProps {
    show_headers?: boolean;
    mode_name: string;
    modes: {[key: string]: ILayoutMode};
}

/**
 * React-компонент "Разметка"
 *
 * Разметка определяет расположение внутренних модулей приложения,
 * компонуя панели в соответствии с выбранным режимом разметки.
 * Режимы разметки задаются в конфигурационном объекте `LayoutConfig`.
 * 
 * @category Core.Views
 */
export default class LayoutView extends View<LayoutProps, LayoutState> {
    private pane_ref: RefObject<Pane> = React.createRef();

    private root_ref: RefObject<HTMLDivElement> = React.createRef();
    private readonly overlay_node: HTMLDivElement;

    static defaultProps: LayoutProps = {
        show_headers: true,
        mode_name: 'default',
        modes: {
            default: {
                policy: PaneOrientation.Horizontal,
                panes: [] as ILayoutPane[],
            }
        }
    }


    constructor(props: AllProps<LayoutProps>) {
        super(props);

        this.state = {
            mode_name: props.mode_name || 'default'
        }

        this.overlay_node = document.createElement('div');
        this.overlay_node.classList.add('layout-overlay');

        window.addEventListener('resize', this.onResize());
    }

    /**
     * Установить режим разметки
     *
     * @param mode название режима разметки из конфигурации
     */
    public setMode(mode: string) {
        if (this.mounted) {
            this.setState({
                mode_name: mode
            });
        } else {
            this.state = {
                mode_name: mode
            };
        }
    }

    public render() {
        super.render();

        return (
            <div ref={this.root_ref} className='layout'>
                {this.renderInside()}
            </div>
        );
    }

    public componentDidUpdate(
        prevProps: Readonly<AllProps<LayoutProps>>,
        prevState: Readonly<LayoutState>,
        snapshot?: any
    ) {
        this.emit(new LayoutFinishedEvent({mode_name: this.state.mode_name}));
    }

    protected renderInside() {
        const modes = this.resolveWidgets(this.props.modes);

        if (!modes[this.state.mode_name]) return null;

        const orientation = modes[this.state.mode_name].policy;
        const panes = modes[this.state.mode_name].panes;

        return (
            <DndProvider backend={HTML5Backend}>
                <Pane is_root={true}
                      panes={panes}
                      name='root'
                      title='root'
                      orientation={orientation}
                      ref={this.pane_ref}
                      overlay_node={this.overlay_node}
                      show_headers={this.props.show_headers}
                      lang={this.props.lang}
                />
            </DndProvider>
        );
    }

    protected viewDidMount() {
        super.viewDidMount();

        this.root_ref.current.appendChild(this.overlay_node);

        this.emit(new LayoutMountEvent({}));
    }

    protected viewWillUnmount() {
        super.viewWillUnmount();

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