import * as React from "react";
import * as ReactDOM from "react-dom";

const modalRoot = document.createElement('div');
modalRoot.id = 'modal-root';
document.body.insertBefore(modalRoot, document.body.firstChild);

/**
 * A component that renders children into a DOM node that exists 
 * outside the DOM hierarchy of the parent component.
 */
export default class Portal extends React.Component {
    private readonly el: HTMLDivElement;

    constructor(props: Readonly<{}>) {
        super(props);
        this.el = document.createElement('div');
    }

    componentDidMount() {
        // The portal element is inserted in the DOM tree after
        // the Modal's children are mounted, meaning that children
        // will be mounted on a detached DOM node. If a child
        // component requires to be attached to the DOM tree
        // immediately when mounted, for example to measure a
        // DOM node, or uses 'autoFocus' in a descendant, add
        // state to Modal and only render the children when Modal
        // is inserted in the DOM tree.
        modalRoot.appendChild(this.el);
    }

    componentWillUnmount() {
        modalRoot.removeChild(this.el);
    }

    render() {
        return ReactDOM.createPortal(
            this.props.children,
            this.el
        );
    }
}