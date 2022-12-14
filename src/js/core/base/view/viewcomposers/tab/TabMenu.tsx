import * as React from "react";
import * as ReactDOM from "react-dom";
import classNames from "classnames";
import {Action, BooleanAction} from "../../../Event";
import TabMenuPopup from "./TabMenuPopup";

/**
 * Props for {@link TabMenu}
 * 
 * @category Core
 * @subcategory View
 */
interface TMProps {
    /** a node where the content will be rendered via portal */
    overlay_node?: HTMLElement;
}

/**
 * State of {@link TabMenu}
 * 
 * @category Core
 * @subcategory View
 */
interface TMState {
    /** whether the menu should be displayed */
    active: boolean;
    /** list of name-action-handler triplets */
    items?: Array<[string, Action<any>, Function]>;
    /** X position of the mouse event causes the popup to appear */
    m_left: number;
    /** Y position of the mouse event causes the popup to appear */
    m_top: number;
    /** width of the tab button clicked */
    m_btn_width: number;
    /** height of the tab button clicked */
    m_btn_height: number;
}

/**
 * Context menu for a {@link Tab}
 * 
 * Controls {@link TabMenuPopup} appearance and positioning.
 * 
 * @category Core
 * @subcategory View
 * 
 * @component
 */
export default class TabMenu extends React.Component<TMProps, TMState> {
    private readonly onglobalclick: () => void;
    private readonly btn_ref: React.RefObject<HTMLDivElement> = React.createRef();

    constructor(props: TMProps) {
        super(props);

        this.state = {
            active: false,
            items: [] as Array<[string, Action<any>, Function]>,
            m_left: 0,
            m_top: 0,
            m_btn_width: 0,
            m_btn_height: 0,
        };

        this.setActive = this.setActive.bind(this);

        this.onglobalclick = () => this.setInactive();
    }

    componentDidMount() {
        document.body.addEventListener("click", this.onglobalclick);
    }

    componentWillUnmount() {
        document.body.removeEventListener("click", this.onglobalclick);
    }

    setItems(items: Array<[string, Action<any>, Function]>) {
        this.setState({...this.state, items});
    }

    render() {
        if (this.state.items.length === 0) return null;

        const btn_klasses = classNames({
           'tab__btn': true,
           'tab__btn_active': this.state.active,
        });

        return (
            <React.Fragment>
                <div className={btn_klasses} onClick={this.setActive} ref={this.btn_ref} />
                {
                    this.state.active ?
                        <TabMenuPopup
                            items={this.state.items}
                            overlay_node={this.props.overlay_node}
                            left={this.state.m_left}
                            top={this.state.m_top}
                            btn_width={this.state.m_btn_width}
                            btn_height={this.state.m_btn_height}
                        /> :
                        null
                }
            </React.Fragment>
        )
    }

    private setActive() {
        const rect = this.btn_ref.current.getBoundingClientRect();

        this.setState({
            active: true,
            m_left: rect.left,
            m_top: rect.top,
            m_btn_width: rect.width,
            m_btn_height: rect.height
        });
    }

    private setInactive() {
        this.setState({active: false});
    }
}