import * as React from "react";
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import Pane from "./Pane";

import {LayoutConfig} from "../../configs/LayoutConfig";
import {RefObject} from "react";
import {IViewProps, IViewState, View} from "../../ui/View";
import {ViewConfig} from "../../configs/ViewConfig";
import views_config from "../../../configs/views";
import modes_config from "../../../configs/layouts";
import IConfigService from "../../services/interfaces/IConfigService";

require('../../../../../app/css/layout.less');

export enum DraggableItemTypes {
    Tab = 'tab'
}

/**
 * Свойства разметки
 */
interface ILayoutProps extends IViewProps {
    // конифгурация режимов разметки
    // config: LayoutConfig,
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
    private pane_ref: RefObject<Pane> = React.createRef();

    private config_layout: LayoutConfig;
    private config_view: ViewConfig;

    constructor(props: ILayoutProps) {
        super(props);

        this.state = {
            mode_name: 'default'
        }

        window.addEventListener('resize', this.onResize());

        // TEMP!!!!
        // TODO: Remove this code an make this.props.connector.app private!!!!!

        this.props.connector.app.instance(IConfigService).configure(ViewConfig, views_config);
        this.props.connector.app.instance(IConfigService).configure(LayoutConfig, modes_config);

        const config_service = this.props.connector.app.instance(IConfigService);
        const config_views = config_service.configuration(ViewConfig);
        const config_layout = config_service.configuration(LayoutConfig);

        this.config_view = config_views;
        this.config_layout = config_layout;

        this.config_layout.resolveViewAliasesToTypes(this.config_view, this.props.connector.app);
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
        const orientation = this.config_layout.modes[this.state.mode_name].policy;

        const panes = this.config_layout.modes[this.state.mode_name].panes;

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