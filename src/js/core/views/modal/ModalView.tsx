import * as React from "react";

import {IViewProps, View} from "../../base/view/View";
import {CSSTransition, TransitionGroup} from "react-transition-group";
import {IModalData} from "../../datatypes/modal";
import Modal, {IModalProps, Overlay} from "./Modal";
import {IDialogProps} from "./Dialog";
import DialogModal from "./DialogModal";
import Nest, {ModalAction, ModalRequestCallback} from "../../base/view/Nest";

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
        let action_request = (action: ModalAction) => this.handleNestModalClose(idx, modal_type, action);

        if (modal_data.widget_alias) {
            [content, action_request] = this.renderNest(idx, modal_type, modal_data);
        }

        if (modal_data.dialog) {
            return [
                this.renderOverlay(idx, modal_type, modal_data, action_request),
                this.renderDialogModal(idx, modal_type, modal_data, content, action_request)
            ]
        } else {
            return [
                this.renderOverlay(idx, modal_type, modal_data, action_request),
                this.renderModal(idx, modal_type, modal_data, content)
            ]
        }
    }

    handleNestModalClose(idx: number, modal_type: string, action: ModalAction) {
        const modal_data = this.props.modals[modal_type][idx];

        modal_data.dialog && modal_data.dialog.on_action && modal_data.dialog.on_action(action);

        if (modal_data.is_close_manual) return;

        this.props.on_close && this.props.on_close(idx, modal_type);
    }

    renderOverlay(idx: number, modal_type: string, modal_data: IModalData, action_request?: ModalRequestCallback) {
        let onclose = modal_data.is_closable !== false ? () => action_request(ModalAction.Escape) : null;

        return (
            <CSSTransition in out key={'o' + idx} classNames='mdl' timeout={0} unmountOnExit>
                <Overlay on_close={onclose} />
            </CSSTransition>
        );
    }

    renderDialogModal(
        idx: number,
        modal_type: string,
        modal_data: IModalData,
        content: string | JSX.Element,
        action_request?: ModalRequestCallback
    ) {
        const dialog_props: IDialogProps = {...modal_data, ...modal_data.dialog};

        return (
            <CSSTransition in out key={'m' + modal_type + idx} timeout={200} classNames="mdl" unmountOnExit>
                <DialogModal
                    size={modal_data.size}
                    width={modal_data.width}
                    height={modal_data.height}

                    {...dialog_props}

                    on_action={(action: ModalAction) => action_request && action_request(action)}
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

    private renderNest(idx: number, modal_type: string, modal_data: IModalData): [JSX.Element, ModalRequestCallback] {
        const widget_alias = modal_data.widget_alias;

        if (!(widget_alias in this.props.widgets)) {
            throw new Error(`Cannot resolve widget by alias ${widget_alias}`)
        }

        const widget = Object.assign({}, this.props.widgets[widget_alias]);

        const nest_ref: React.Ref<Nest> = React.createRef();

        const action_request = (action: ModalAction) => {
            if (nest_ref.current && !nest_ref.current.handleModalAction(action)) {
                this.handleNestModalClose(idx, modal_type, action);
            }
        }

        const nest = (
            <Nest connector={widget.connector}
                  index={0}
                  label={widget.label}
                  widget_alias={widget.alias}
                  view_type={widget.view_type}
                  view_props={widget.view_props}
                  on_action_request={(action) => this.handleNestModalClose(idx, modal_type, action)}
                  ref={nest_ref}
            />
        )

        return [nest, action_request];
    }
}