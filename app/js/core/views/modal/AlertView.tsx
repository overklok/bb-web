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
    BoardDisconnectedDemo,
    ShortCircuit
}

interface IAlert {
    title: string;
    size: ModalSize;
    content?: string;
    label_accept?: string;
    is_closable: boolean;
    is_acceptable: boolean;
    no_overlay?: boolean;
}

interface IAlertHandlers {
    on_accept?: Function;
    on_close?: (type: AlertType) => void;
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
        label_accept: 'Продолжить в автономном режиме',
        size: 'md',
        is_closable: false,
        is_acceptable: true
    },
    [AlertType.ShortCircuit]: {
        title: 'Короткое замыкание!',
        content: 'Разомкните цепь, чтобы устранить короткое замыкание.',
        size: 'md',
        is_closable: false,
        is_acceptable: false,
        no_overlay: false,
    }
}

interface AlertViewProps extends IViewState {
    alerts: {[type: number]: IAlertHandlers};
}

export default class AlertView extends View<AlertViewProps, null> {
    static defaultProps: AlertViewProps = {
        alerts: [],
    }

    constructor(props: AllProps<AlertViewProps>) {
        super(props);
    }

    handleAlertClose(type: AlertType) {
        this.props.alerts[type] && this.props.alerts[type].on_close && this.props.alerts[type].on_close(type);
    }

    handleAlertAccept(type: AlertType) {
        this.props.alerts[type] && this.props.alerts[type].on_accept && this.props.alerts[type].on_accept(type);
    }

    render(): React.ReactNode {
        return (
            <TransitionGroup component={null}>
                {Object.keys(this.props.alerts).map((type, idx) => [
                    this.renderOverlay(Number(type), idx),
                    this.renderAlert(Number(type), idx)
                ])}
            </TransitionGroup>
        )
    }

    renderOverlay(type: number, idx: number) {
        const alert = ALERT_DATA[type];

        if (alert.no_overlay) return null;

        return (
            <CSSTransition key={'o_' + idx} classNames='mdl' timeout={0} unmountOnExit>
                <Overlay
                    on_close={alert.is_closable ? () => this.handleAlertClose(type) : null}
                />
            </CSSTransition>
        )
    }

    renderAlert(type: number, idx: number) {
        const alert = ALERT_DATA[type];

        return (
            <CSSTransition key={'a_' + idx} in out timeout={200} classNames="mdl" unmountOnExit>
                <DialogModal size={alert.size}
                    is_centered={true}
                    label_accept={alert.label_accept}
                    is_acceptable={alert.is_acceptable}
                    on_action={() => this.handleAlertAccept(type)}
                >
                    <h2>{alert.title}</h2>
                    <p>{alert.content}</p>
                </DialogModal>
            </CSSTransition>
        )
    }
}