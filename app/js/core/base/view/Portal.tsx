import * as React from "react";
import * as ReactDOM from "react-dom";

const modalRoot = document.createElement('div');
modalRoot.id = 'modal-root';
document.body.insertBefore(modalRoot, document.body.firstChild);

export default class Portal extends React.Component {
    private readonly el: HTMLDivElement;

    constructor(props: Readonly<{}>) {
        super(props);
        this.el = document.createElement('div');
    }

    componentDidMount() {
        // Элемент портала добавляется в DOM-дерево после того, как
        // потомки компонента Modal будут смонтированы, это значит,
        // что потомки будут монтироваться на неприсоединённом DOM-узле.
        // Если дочерний компонент должен быть присоединён к DOM-дереву
        // сразу при подключении, например, для замеров DOM-узла,
        // или вызова в потомке 'autoFocus', добавьте в компонент Modal
        // состояние и рендерите потомков только тогда, когда
        // компонент Modal уже вставлен в DOM-дерево.
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