import * as React from "react";
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import Pane from "./Pane";

import {LayoutConfig} from "../../configs/LayoutConfig";
import {RefObject} from "react";

require('css/layout.less');

/**
 * Свойства разметки
 */
interface ILayoutProps {
    // конифгурация режимов разметки
    config: LayoutConfig,
}

/**
 * Состояние разметки
 */
interface ILayoutState {
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
export default class Layout extends React.Component<ILayoutProps, ILayoutState> {
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
     * @param mode название режима разметки из конифгурации
     */
    setMode(mode: string) {
        this.setState({
            mode_name: mode
        });
    }

    render() {
        const orientation = this.props.config.modes[this.state.mode_name].policy;

        const panes = this.props.config.modes[this.state.mode_name].panes;

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