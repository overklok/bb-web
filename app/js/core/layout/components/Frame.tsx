import * as React from "react";
import Tab from "./Tab";
import Nest from "./Nest";

interface IProps {
    children: JSX.Element[]
}

interface IState {
    active_tab: number
}

export default class Frame extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            active_tab: 0,
        };

        this.onClickTabItem = this.onClickTabItem.bind(this);
    }

    onClickTabItem(tab_index: number) {
        this.setState({ active_tab: tab_index });
    }

    render() {
        const {
            onClickTabItem,
            props: {
                children
            },
            state: {
                active_tab
            }
        } = this;

        return (
            <div className='frame'>
                <div className="tab-list">
                    {children.map((child, index) => {
                        const { label } = child.props;

                        return (
                            <Tab
                                active_tab={active_tab}
                                key={index}
                                index={index}
                                label={label}
                                on_click={onClickTabItem}
                            />
                        );
                    })}
                </div>
                <div className="tab-content">
                    {children.map(child => {
                        if (child.props.index !== active_tab) return undefined;

                        return child;
                    })}
                </div>
            </div>
        )
    }
}