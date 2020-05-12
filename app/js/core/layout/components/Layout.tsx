import * as React from "react";
import Pane from "./Pane";

import {LayoutConfiguration} from "../../configuration/LayoutConfiguration";

require('css/layout.less');

/**
 * Свойства разметки
 */
interface ILayoutProps {
    // конифгурация режимов разметки
    config: LayoutConfiguration,
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
 * Режимы разметки заданются в конфигурационном объекте `LayoutConfiguration`.
 */
export default class Layout extends React.Component<ILayoutProps, ILayoutState> {
    constructor(props: ILayoutProps) {
        super(props);

        this.state = {
            mode_name: 'default'
        }
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
            <Pane is_root={true} panes={panes} name='root' orientation={orientation} />
        );
    }
}