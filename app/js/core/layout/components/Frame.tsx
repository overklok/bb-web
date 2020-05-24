import * as React from "react";
import Tab from "./Tab";
import SingleTab from "./SingleTab";

interface IProps {
    children: JSX.Element[] // usually a Nest creators
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
        if (this.props.children.length > 1) {
            return this.renderMultiChild();
        } else {
            return this.renderSingleChild();
        }
    }

    renderSingleChild() {
        const {
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
                            <SingleTab label={label} key={index} />
                        )
                    })}
                </div>
                <div className="tab-content">
                    {this.props.children}
                </div>
            </div>
        )
    }

    renderMultiChild() {
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
                                is_single={false}
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
        );
    }
}