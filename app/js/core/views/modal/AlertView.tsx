import * as React from "react";

import {AllProps, IViewProps, IViewState, View} from "../../base/view/View";
import {CSSTransition, TransitionGroup} from "react-transition-group";
import {ColorAccent} from "../../helpers/styles";
import {Toast} from "./Toast";
import Modal, {ModalSize, Overlay} from "./Modal";
import Dialog from "./Dialog";
import DialogModal from "./DialogModal";

interface AlertViewProps extends IViewState {
    title?: string;
    content?: string;
    dismissible?: boolean;
    size: ModalSize;
    on_close?: (idx: number) => void;
}

export default class AlertView extends View<AlertViewProps, null> {
    static defaultProps: AlertViewProps = {
        size: 'md',
        title: null,
        content: null,
        dismissible: true
    }

    constructor(props: AllProps<AlertViewProps>) {
        super(props);

        this.handleAlertClose = this.handleAlertClose.bind(this);
    }

    handleAlertClose(idx: number) {
        this.props.on_close && this.props.on_close(idx);
    }

    render(): React.ReactNode {
        return (
            <TransitionGroup component={null}>
                {this.renderOverlay()}
                {this.renderAlert()}
            </TransitionGroup>
        )
    }

    renderOverlay() {
        if (!this.props.title && !this.props.content) return null;

        return (
            <CSSTransition key={0} classNames='mdl' timeout={0} unmountOnExit>
                <Overlay onClose={this.handleAlertClose}/>
            </CSSTransition>
        )
    }

    renderAlert() {
        if (!this.props.title && !this.props.content) return null;

        return (
            <CSSTransition key={1} in out timeout={200} classNames="mdl" unmountOnExit>
                <DialogModal size={this.props.size} is_centered={true}>
                    <h2>{this.props.title}</h2>
                    <p>{this.props.content}</p>
                </DialogModal>
            </CSSTransition>
        )
    }
}