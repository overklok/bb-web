import * as React from "react";
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import Pane, {PaneOrientation} from "./Pane";

import {RefObject} from "react";
import {IViewProps, IViewState, View} from "../../base/View";
import {ILayoutMode, ILayoutPane, ViewOptionRaw} from "../../models/LayoutModel";
import ViewConnector from "../../base/ViewConnector";
import Presenter from "../../base/Presenter";
import Application from "../../Application";

require('../../../../../app/css/layout.less');

export enum DraggableItemTypes {
    Tab = 'tab'
}

export type ViewOption = {connector: ViewConnector, type: typeof View, label: string};

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
    views: ViewOptionRaw[];
    view_options: ViewOption[];
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

export interface IWidget {
    view_type: typeof View;
    presenter_types: typeof Presenter[];
}

/**
 * Свойства разметки
 */
interface ILayoutProps extends IViewProps {
    // конифгурация режимов разметки
    modes: {[key: string]: ILayoutMode};
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
export default class Layout extends View<ILayoutProps, ILayoutState> {
    static defaultProps = {
        modes: {
            default: {
                policy: PaneOrientation.Horizontal,
                panes: [] as ILayoutPane[]
            }
        }
    };

    private pane_ref: RefObject<Pane> = React.createRef();

    constructor(props: ILayoutProps) {
        super(props);

        this.state = {
            mode_name: 'default'
        }

        window.addEventListener('resize', this.onResize());
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
        const orientation = this.props.modes[this.state.mode_name].policy;

        const panes = this.props.modes[this.state.mode_name].panes;

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

    private resolveViewAliasesToTypes(app: Application) {
        for (const mode of Object.values(this.modes)) {
            for (const pane of mode.panes) {
                this.resolvePaneViewAliasesToTypes(pane, app);
            }
        }
    }

    private resolvePaneViewAliasesToTypes(pane: ILayoutPane, app: Application) {
        // Выполнить перебор вложенных панелей (головная рекурсия)
        if (pane.panes) {
            for (const subpane of pane.panes) {
                this.resolvePaneViewAliasesToTypes(subpane, app);
            }
        }

        for (let {alias, label} of pane.views) {
            const view_assoc = this.widgets[alias];
            const {view_type, presenter_types} = view_assoc;

            if (!view_type) throw new Error(`View type '${alias}' does not exist`);

            const view_connector = new ViewConnector(app, presenter_types);

            pane.view_options.push(<ViewOption>({
                type: view_type,
                label: label,
                alias: alias,
                connector: view_connector
            } as object));
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