import * as React from "react";
import SingleTab from "./SingleTab";
import Tab from "./Tab";
import TabMenu from "./TabMenu";
import ViewConnector from "../../../ViewConnector";
import ViewComposer, {IVCProps, IVCState} from "../../ViewComposer";

/**
 * @category Core
 * @subcategory View
 */
interface TVCProps extends IVCProps {
    overlay_node?: HTMLElement
    show_headers?: boolean
}

/**
 * @category Core
 * @subcategory View
 */
interface TVCState extends IVCState {
    active_tab: number
}

/**
 * Displays only first {@link View} in the collection
 * 
 * @category Core
 * @subcategory View
 * 
 * @component
 */
export default class TabViewComposer extends ViewComposer<TVCProps, TVCState> {
    static defaultProps = {
        show_headers: true
    }

    private view_connectors: Array<[ViewConnector, React.RefObject<TabMenu>]> = [];

    constructor(props: TVCProps) {
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
                children,
                overlay_node,
                show_headers
            },
        } = this;

        this.resetViewConnectors();

        return (
            <div className='tab-display'>
                {!show_headers
                    ? null
                    :
                    <div className="tab-list">
                        {children.map((child, index) => {
                            const {label, connector} = child.props;
                            const ref: React.RefObject<TabMenu> = React.createRef();

                            this.registerViewConnector(connector, ref);

                            return (
                                <SingleTab label={label} key={index} ref={ref} overlay_node={overlay_node}/>
                            )
                        })}
                    </div>
                }
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
                children,
                overlay_node,
                show_headers
            },
            state: {
                active_tab
            },
        } = this;

        this.resetViewConnectors();

        return (
            <div className='tab-display'>
            {/*<div className='tab-display' ref={this.props.refCallback}>*/}
                {!show_headers
                    ? null
                    :
                    <div className="tab-list">
                        {children.map((child, index) => {
                            const {label, connector} = child.props;
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
                                    overlay_node={overlay_node}
                                />
                            );
                        })}
                    </div>
                }
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