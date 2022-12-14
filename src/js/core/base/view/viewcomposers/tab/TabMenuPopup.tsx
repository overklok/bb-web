import * as React from "react";
import * as ReactDOM from "react-dom";
import {Action, BooleanAction} from "../../../Event";

/**
 * Props for {@link TabMenuPopup}
 * 
 * @category Core
 * @subcategory View
 */
interface TMPProps {
    /** a node where the content will be rendered via portal */
    overlay_node?: HTMLElement;
    /** list of name-action-handler triplets */
    items?: Array<[string, Action<any>, Function]>;
    /** X position of the mouse event caused the popup to appear */
    left: number;
    /** Y position of the mouse event caused the popup to appear */
    top: number;
    /** width of the tab button clicked */
    btn_width: number;
    /** height of the tab button clicked */
    btn_height: number;
}

/**
 * Popup for a {@link Tab} menu component
 * 
 * Displays actions defined in {@link Presenter}s related to the {@link View}
 * the tab links to.
 * 
 * @see TabMenu
 * 
 * @category Core
 * @subcategory View
 * 
 * @component
 */
export default class TabMenuPopup extends React.Component<TMPProps> {
    private readonly ul_ref: React.RefObject<HTMLUListElement> = React.createRef();

    constructor(props: TMPProps) {
        super(props);
    }

    componentDidMount() {
        const rect_popup = this.ul_ref.current.getBoundingClientRect(),
              rect_doc = document.body.getBoundingClientRect();

        if (rect_popup.right > rect_doc.right) {
            this.ul_ref.current.style.left = `${this.props.left - rect_popup.width}px`;
        }

        if (rect_popup.left < rect_doc.left) {
            this.ul_ref.current.style.left = `${rect_doc.left}px`;
        }

        if (rect_popup.bottom > rect_doc.bottom) {
            this.ul_ref.current.style.top = `${this.props.top - rect_popup.height}px`;
        }

        if (rect_popup.top < rect_doc.top) {
            this.ul_ref.current.style.top = `${rect_doc.top}px`;
        }
    }

    componentWillUnmount() {

    }

    render() {
        if (this.props.overlay_node) {
            return ReactDOM.createPortal(
                this.renderContents(),
                this.props.overlay_node
            );
        } else {
            return this.renderContents();
        }
    }

    private renderContents() {
        if (this.props.items.length === 0) return null;

        const left = this.props.left + this.props.btn_width,
            top = this.props.top + this.props.btn_height;

        return (
            <ul className='ddmenu' style={{left, top}} ref={this.ul_ref}>
                {
                    this.props.items.map(([name, action_type, cb], index) => {
                        if (action_type === null) {
                            return <li key={index}><hr/></li>;
                        }

                        switch ((action_type as any).Alias) {
                            case BooleanAction.Alias:
                                return <li key={index} onClick={() => {cb()}}>{`[B] ${name}`}</li>;
                            default:
                                return <li key={index} onClick={() => {cb()}}>{name}</li>;
                        }
                    })
                }
            </ul>
        )
    }
}