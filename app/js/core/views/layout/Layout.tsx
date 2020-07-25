import * as React from "react";
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import Pane, {PaneOrientation} from "./Pane";

import {RefObject} from "react";
import {IViewProps, IViewState, View} from "../../base/View";
import {ILayoutMode, ILayoutPane} from "../../models/LayoutModel";

require('../../../../../app/css/layout.less');

export enum DraggableItemTypes {
    Tab = 'tab'
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