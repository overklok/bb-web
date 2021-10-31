import * as React from "react";

import {AllProps, IViewProps, View} from "../base/view/View";
import {CSSTransition, TransitionGroup} from "react-transition-group";
import Modal, {ModalSize, Overlay} from "./modal/Modal";
import DialogModal from "./modal/DialogModal";

import i18next from 'i18next';

/**
 * TODO: Remove app-specific declarations from core 
 */
export const enum AlertType {
    IssueReportCompleted,
    BoardDisconnected,
    BoardDisconnectedDemo,
    ShortCircuit
}

/**
 * Data object for Alert
 * 
 * @category Core.Views
 * @subcategory DataObjects
 */
interface IAlert {
    title: string;
    size: ModalSize;
    content?: string;
    label_accept?: string;
    is_closable: boolean;
    is_acceptable: boolean;
    no_overlay?: boolean;
}

/**
 * @category Core.Views
 * @subcategory DataObjects
 */
interface IAlertHandlers {
    on_accept?: Function;
    on_close?: (type: AlertType) => void;
}

/**
 * @category Core.Views
 */
interface AlertViewProps extends IViewProps {
    alerts: {[type: number]: IAlertHandlers};
}

/**
 * @category Core.Views
 */
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
        const alert = this.getAlertData(type);

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
        const alert = this.getAlertData(type);

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

    getAlertData(key: number): IAlert {
        switch (key) {
         case AlertType.IssueReportCompleted: 
            return {
                title: i18next.t('main:alert.issue_report_completed.title'),
                size: 'md',
                is_closable: true,
                is_acceptable: true,
                label_accept: i18next.t('main:alert.issue_report_completed.accept')
            };
        case AlertType.BoardDisconnected: 
            return {
                title: i18next.t('main:alert.board_disconnected.title'),
                content: i18next.t('main:alert.board_disconnected.content'),
                size: 'md',
                is_closable: false,
                is_acceptable: false
            };
        case AlertType.BoardDisconnectedDemo: 
            return {
                title: i18next.t('main:alert.board_disconnected.title'),
                content: i18next.t('main:alert.board_disconnected.content'),
                label_accept: i18next.t('main:alert.board_disconnected.accept'),
                size: 'md',
                is_closable: false,
                is_acceptable: true
            };
        case AlertType.ShortCircuit: 
            return {
                title: i18next.t('main:short_circuit.title'),
                content: i18next.t('main:short_circuit.content'),
                size: 'md',
                is_closable: false,
                is_acceptable: false,
                no_overlay: false,
            };
        }
    }
}