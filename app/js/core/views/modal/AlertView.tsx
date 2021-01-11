import * as React from "react";

import {AllProps, IViewProps, IViewState, View} from "../../base/view/View";
import {CSSTransition, TransitionGroup} from "react-transition-group";
import {ColorAccent} from "../../helpers/styles";
import {Toast} from "./Toast";
import Modal, {ModalSize, Overlay} from "./Modal";
import Dialog from "./Dialog";
import DialogModal from "./DialogModal";

export const enum AlertType {
    BoardDisconnected,
    BoardDisconnectedDemo
}

interface IAlert {
    title: string;
    content: string;
    size: ModalSize;
    label_accept?: string;
    is_closable: boolean,
    is_acceptable: boolean
}

const ALERT_DATA: {[key: number]: IAlert} = {
    [AlertType.BoardDisconnected]: {
        title: 'Доска отключена',
        content: 'Использовать программу без подключённой доски невозможно.',
        size: 'md',
        is_closable: false,
        is_acceptable: false
    },
    [AlertType.BoardDisconnectedDemo]: {
        title: 'Доска отключена',
        content: 'Использовать программу без подключённой доски невозможно.',
        label_accept: 'Продолжить в режиме презентации',
        size: 'md',
        is_closable: false,
        is_acceptable: true
    }
}

interface AlertViewProps extends IViewState {
    type?: AlertType
    on_accept?: (type: AlertType) => void;
    on_close?: (type: AlertType) => void;
}

export default class AlertView extends View<AlertViewProps, null> {
    static defaultProps: AlertViewProps = {
        type: undefined,
    }

    constructor(props: AllProps<AlertViewProps>) {
        super(props);
    }

    handleAlertClose(type: AlertType) {
        this.props.on_close && this.props.on_close(type);
    }

    handleAlertAccept(type: AlertType) {
        this.props.on_accept && this.props.on_accept(type);
    }

    render(): React.ReactNode {
        return (
            <TransitionGroup component={null}>
                {this.props.type != null ? this.renderOverlay() : null}
                {this.props.type != null ? this.renderAlert() : null}
            </TransitionGroup>
        )
    }

    renderOverlay() {
        const alert = ALERT_DATA[this.props.type];

        return (
            <CSSTransition key={0} classNames='mdl' timeout={0} unmountOnExit>
                <Overlay
                    onClose={alert.is_closable ? () => this.handleAlertClose(this.props.type) : null}
                />
            </CSSTransition>
        )
    }

    renderAlert() {
        const alert = ALERT_DATA[this.props.type];

        return (
            <CSSTransition key={1} in out timeout={200} classNames="mdl" unmountOnExit>
                <DialogModal size={alert.size}
                             is_centered={true}
                             label_accept={alert.label_accept}
                             on_accept={alert.is_acceptable ? () => this.handleAlertAccept(this.props.type) : null}
                >
                    <h2>{alert.title}</h2>
                    <p>{alert.content}</p>
                </DialogModal>
            </CSSTransition>
        )
    }
}