import * as React from "react";
import SingleTab from "./SingleTab";
import Tab from "./Tab";
import TabMenu from "./TabMenu";
import ViewConnector from "../../ViewConnector";
import ViewComposer, {IVCProps, IVCState} from "../../ViewComposer";

interface IState extends IVCState {
    active_tab: number
}

export default class TabViewComposer extends ViewComposer<IVCProps, IState> {
    private view_connectors: Array<[ViewConnector, React.RefObject<TabMenu>]> = [];

    constructor(props: IVCProps) {
        super(props);

        this.state = {
            active_tab: 0,
        };

        this.onClickTabItem = this.onClickTabItem.bind(this);
    }

    componentDidMount() {
        for (const [view_connector, menuref] of this.view_connectors) {
            menuref.current.setItems(view_connector.actions);
        }
    }

    componentDidUpdate() {
        for (const [view_connector, menuref] of this.view_connectors) {
            menuref.current.setItems(view_connector.actions);
        }
    }

    render() {
        this.view_connectors = [];

        if (this.props.children.length > 1) {
            return this.renderMultiChild();
        } else {
            return this.renderSingleChild();
        }
    }

    resetViewConnectors() {
        this.view_connectors = [];
    }

    registerViewConnector(view_connector: ViewConnector, ref: React.RefObject<TabMenu>) {
        this.view_connectors.push([view_connector, ref]);
    }

    renderSingleChild() {
        const {
            props: {
                children
            },
        } = this;

        this.resetViewConnectors();

        return (
            <div className='tab-display'>
                <div className="tab-list">
                    {children.map((child, index) => {
                        const { label, connector } = child.props;
                        const ref: React.RefObject<TabMenu> = React.createRef();

                        this.registerViewConnector(connector, ref);

                        return (
                            <SingleTab label={label} key={index} ref={ref}/>
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

        this.resetViewConnectors();

        return (
            <div className='tab-display'>
                <div className="tab-list">
                    {children.map((child, index) => {
                        const { label, connector } = child.props;
                        const ref: React.RefObject<TabMenu> = React.createRef();

                        this.registerViewConnector(connector, ref);

                        return (
                            <Tab
                                ref={ref}
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

    private onClickTabItem(tab_index: number) {
        this.setState({ active_tab: tab_index });
    }
}