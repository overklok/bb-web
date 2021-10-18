import * as React from "react";
import i18next from "i18next";

import {IViewProps, View} from "../../base/view/View";
import {CSSTransition, TransitionGroup} from "react-transition-group";
import {IModalData} from "../../datatypes/modal";
import Modal, {IModalProps, Overlay} from "./Modal";
import {IDialogProps} from "./Dialog";
import DialogModal from "./DialogModal";
import Nest, {ModalAction, ModalRequestCallback} from "../../base/view/Nest";

/** {@link ModalView} props */
interface ModalViewProps extends IViewProps {
    /** the list of the data objects for the Modals required to display */
    modals: {[type: string]: IModalData[]};
    /** a function to call when arbitrary Modal is closed */
    on_close?: (idx: number, modal_type: string) => void;
}

/**
 * A View that aggregates {@link Modal} components containing another {@link Views}
 * 
 * Contains {@link} {@link Modal}s required to display currently.
 * It's intended to render it globally with absolute positioning and overlay.
 */
export default class ModalView extends View<ModalViewProps, null> {
    static defaultProps: ModalViewProps = {
        modals: {},
    }

    render(): React.ReactNode {
        // Render Modals based on its data objects, one by one
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

    /**
     * Renders single Modal wrapped depending on the requirements 
     * specified in the data object
     * 
     * To prevent the modal of the same type to duplicate, specify
     * `modal_type` string identifier. It will guarantee the new modal with the same 
     * `modal_type` will replace the modal currently displayed. 
     * 
     * @param idx           index of the modal to refer when requested to remove it
     * @param modal_type    string identifier of the modal type
     * @param modal_data    properties of the modal
     * 
     * @returns React nodes to render the modal
     */
    renderItem(idx: number, modal_type: string, modal_data: IModalData) {
        /** the pure content of the modal */
        let content: string | JSX.Element = modal_data.content;
        /** the function to handle action request */
        let action_request = (action: ModalAction) => this.handleNestModalClose(idx, modal_type, action);

        // If there are the widget required to render inside the modal,
        // render it within the Nest since it's required to wrap the View.
        if (modal_data.widget_alias) {
            // If the complex modal is requested, override default action request handler
            [content, action_request] = this.renderNest(idx, modal_type, modal_data);
        }

        // Render overlay then the modal on top of it.
        // The overlay is rendered regardless of whether a dimmer is required 
        // to make it possible to handle escapes (mouse clicks around the modal to close it).
        // If the dialog is required to render, use the appropriate wrapper.
        if (modal_data.dialog) {
            // Renders modal wrapped by dialog on top of the overlay
            return [
                this.renderOverlay(idx, modal_type, modal_data, action_request),
                this.renderDialogModal(idx, modal_type, modal_data, content, action_request)
            ]
        } else {
            // Renders pure modal on top of the overlay
            return [
                this.renderOverlay(idx, modal_type, modal_data, action_request),
                this.renderModal(idx, modal_type, modal_data, content)
            ]
        }
    }

    /**
     * 
     * 
     * @param idx 
     * @param modal_type 
     * @param action 
     * @returns 
     */
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
        const dialog_props: IDialogProps = {
            ...modal_data,
            ...modal_data.dialog,
            heading: i18next.t(modal_data.dialog.heading),
            label_accept: i18next.t(modal_data.dialog.label_accept),
            label_dismiss: i18next.t(modal_data.dialog.label_dismiss),
        };
        
        content = typeof content === 'string' ? i18next.t(content) : content;

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
        content = typeof content === 'string' ? i18next.t(content) : content;

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
                lang={this.props.lang}
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