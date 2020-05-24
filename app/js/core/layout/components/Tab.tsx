import * as React from "react";
import classNames from "classnames";

interface IProps {
    label: string,
    index: number,
    is_single?: boolean,
    active_tab: number,
    on_click?: Function,
}

export default class Tab extends React.Component<IProps, null> {
    static defaultProps = {
        is_single: false,
    };

    constructor(props: IProps) {
        super(props);

        this.onClick = this.onClick.bind(this);
    }

    onClick() {
        const { index, on_click } = this.props;

        if (!this.props.is_single && this.props.on_click) {
            on_click(index);
        }
    }

    render() {
        const {props: {is_single, active_tab, index, label}} = this;

        // Список классов, которые должны использоваться в зависимости от свойств
        let klasses = classNames({
            'tab': true,
            'tab_active': active_tab == index,
            'tab_single': is_single
        });

        return (
            <li className={klasses} onClick={this.onClick}>
                <span>{label}</span>
            </li>
        )
    }
}