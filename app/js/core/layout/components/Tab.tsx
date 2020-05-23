import * as React from "react";
import classNames from "classnames";

interface IProps {
    label: string,
    index: number,
    active_tab: number,
    on_click: Function,
}

export default class Tab extends React.Component<IProps, null> {
    constructor(props: IProps) {
        super(props);

        this.onClick = this.onClick.bind(this);
    }

    onClick() {
        const { index, on_click } = this.props;

        on_click(index);
    }

    render() {
        const {props: {active_tab, index, label}} = this;

        // Список классов, которые должны использоваться в зависимости от свойств
        let klasses = classNames({
            'tab': true,
            'tab_active': active_tab == index
        });

        return (
            <li className={klasses} onClick={this.onClick}>
                <span>{label}</span>
            </li>
        )
    }
}