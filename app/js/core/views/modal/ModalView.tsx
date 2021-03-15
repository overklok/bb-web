import * as React from "react";

import {AllProps, IViewProps, IViewState, View} from "../../base/view/View";
import {CSSTransition, TransitionGroup} from "react-transition-group";
import {IModalData} from "../../datatypes/modal";
import Modal, {IModalProps, Overlay} from "./Modal";
import {IDialogProps} from "./Dialog";
import DialogModal from "./DialogModal";
import Nest from "../../base/view/Nest";

interface ModalViewProps extends IViewProps {
    modals: {[type: string]: IModalData[]};
    on_close?: (idx: number, modal_type: string) => void;
}

export default class ModalView extends View<ModalViewProps, null> {
    static defaultProps: ModalViewProps = {
        modals: {},
    }

    render(): React.ReactNode {
        return (
            <TransitionGroup component={null}>
                {Object.keys(this.props.modals).map((modal_type, i) =>
                    this.props.modals[modal_type].map((modal_data, idx) =>
                        this.renderItem(idx, modal_type, modal_data)
                    )
                )}
            </TransitionGroup>
        )
    }

    renderItem(idx: number, modal_type: string, modal_data: IModalData) {
        let content: string | JSX.Element = modal_data.content;

        if (modal_data.widget_alias) {
            content = this.renderNest(idx, modal_type, modal_data);
        }

        if (modal_data.dialog) {
            return [
                this.renderOverlay(idx, modal_type, modal_data),
                this.renderDialogModal(idx, modal_type, modal_data, content)
            ]
        } else {
            return [
                this.renderOverlay(idx, modal_type, modal_data),
                this.renderModal(idx, modal_type, modal_data, content)
            ]
        }
    }

    handleModalClose(idx: number, modal_type: string) {
        this.props.on_close && this.props.on_close(idx, modal_type);
    }

    handleCloseRequest(idx: number, modal_type: string, modal_data: IModalData) {
        if (modal_data.is_closable !== false) {
            this.handleModalClose(idx, modal_type);
        }
    }

    renderOverlay(idx: number, modal_type: string, modal_data: IModalData) {
        return (
            <CSSTransition in out key={'o' + idx} classNames='mdl' timeout={0} unmountOnExit>
                <Overlay onClose={() => this.handleCloseRequest(idx, modal_type, modal_data)}/>
            </CSSTransition>
        );
    }

    renderDialogModal(idx: number, modal_type: string, modal_data: IModalData, content: string | JSX.Element) {
        const dialog_props: IDialogProps = {...modal_data, ...modal_data.dialog};

        return (
            <CSSTransition in out key={'m' + modal_type + idx} timeout={200} classNames="mdl" unmountOnExit>
                <DialogModal
                    size={modal_data.size}
                    width={modal_data.width}
                    height={modal_data.height}
                    on_close={() => this.handleModalClose(idx, modal_type)}
                    {...dialog_props}
                >
                    {content}
                </DialogModal>
            </CSSTransition>
        )
    }

    private renderModal(idx: number, modal_type: string, props: IModalProps, content: string | JSX.Element) {
        return (
            <CSSTransition in out key={'m' + modal_type + idx} timeout={200} classNames="mdl" unmountOnExit>
                <Modal size={props.size} width={props.width} height={props.height}>
                    {content}
                </Modal>
            </CSSTransition>
        )
    }

    private renderNest(idx: number, modal_type: string, modal_data: IModalData): JSX.Element {
        const widget_alias = modal_data.widget_alias;

        if (!(widget_alias in this.props.widgets)) {
            throw new Error(`Cannot resolve widget by alias ${widget_alias}`)
        }

        const widget = Object.assign({}, this.props.widgets[widget_alias]);

        const nest_ref: React.Ref<Nest> = React.createRef();

        const close_request = () => {
            if (nest_ref.current && !nest_ref.current.requestModalClose()) {
                this.handleModalClose(idx, modal_type);
            }
        }

        return (
            <Nest connector={widget.connector}
                  index={0}
                  label={widget.label}
                  view_type={widget.view_type}
                  view_props={widget.view_props}
                  close_request={() => this.handleModalClose(idx, modal_type)}
                  ref={nest_ref}
            />
        )
    }
}