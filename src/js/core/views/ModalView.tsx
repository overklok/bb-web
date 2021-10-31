import * as React from "react";
import i18next from "i18next";

import {IViewProps, View} from "../base/view/View";
import {CSSTransition, TransitionGroup} from "react-transition-group";
import {IModalData} from "../datatypes/modal";
import Modal, {ModalProps, Overlay} from "./modal/Modal";
import {DialogProps} from "./modal/Dialog";
import DialogModal from "./modal/DialogModal";
import Nest from "../base/view/Nest";

/**
 * Types of actions available in the Modal
 * 
 * @category Core.Views
 */
export enum ModalAction {
    Escape,
    Dismiss,
    Accept
}

/**
 * Modal action request handler
 * 
 * Calls when user interacts with UI element (button / overlay click)
 * to perform an modal-related action.
 * 
 * @category Core.Views
 */
type ModalActionHandler = (action: ModalAction) => void;

/** 
 * Props for {@link ModalView} component 
 * 
 * @category Core.Views
 */
interface ModalViewProps extends IViewProps {
    /** the list of the data objects for the Modals required to display, grouped by type */
    modals: {[type: string]: IModalData[]};
    /** a function to call when arbitrary Modal is closed */
    on_close?: (idx: number, modal_type: string) => void;
}

/**
 * A View that aggregates {@link Modal} components containing another {@link Views}
 * 
 * Contains {@link} {@link Modal}s required to display currently.
 * It's intended to render it globally with absolute positioning and overlay.
 * 
 * Modals are grouped so that they only overlap each other within their specific type.
 * 
 * @see ModalViewProps
 * 
 * @category Core.Views
 */
export default class ModalView extends View<ModalViewProps, null> {
    static defaultProps: ModalViewProps = {
        modals: {},
    }

    /**
     * Renders {@link Modal}s based on its data objects, one by one
     */
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

    /**
     * Renders single {@link Modal} wrapped depending on the requirements 
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
     * @returns React nodes containing the modal
     */
    renderItem(idx: number, modal_type: string, modal_data: IModalData) {
        /** pure content of the modal */
        let content: string | JSX.Element = modal_data.content;
        /** function to handle action request */
        let action_handler = (action: ModalAction) => this.handleNestModalAction(idx, modal_type, modal_data, action);

        // If there are the widget required to render inside the modal,
        // render it within the Nest since it's required to wrap the View.
        if (modal_data.widget_alias) {
            // If the complex modal is requested, override default action request handler
            content = this.renderNest(modal_data);
        }

        // Render overlay then the modal on top of it.
        // The overlay is rendered regardless of whether a dimmer is required 
        // to make it possible to handle escapes (mouse clicks around the modal to close it).
        // If the dialog is required to render, use the appropriate wrapper.
        if (modal_data.dialog) {
            // Renders modal wrapped by dialog on top of the overlay
            return [
                this.renderOverlay(idx, modal_type, modal_data, action_handler),
                this.renderDialogModal(idx, modal_type, modal_data, content, action_handler)
            ]
        } else {
            // Renders pure modal on top of the overlay
            return [
                this.renderOverlay(idx, modal_type, modal_data, action_handler),
                this.renderModal(idx, modal_type, modal_data, content)
            ]
        }
    }

    /**
     * Handles modal action requested by user via modal's UI
     * 
     * By default, closes the modal if manual closing is not enabled.
     * Calls app-defined action handler if provided.
     * 
     * @param idx           modal item index in the list of modals of given type
     * @param modal_type    type of the modal
     * @param action        type of action requested
     */
    handleNestModalAction(
        idx: number, 
        modal_type: string, 
        modal_data: IModalData, 
        action: ModalAction
    ) {
        modal_data.dialog && modal_data.dialog.on_action && modal_data.dialog.on_action(action);

        if (modal_data.is_close_manual) return;

        this.props.on_close && this.props.on_close(idx, modal_type);
    }

    /**
     * Renders modal overlay
     * 
     * Overlay is required to trigger {@link ModalAction.Escape} by clicking 
     * on the modal surround.
     * 
     * Additionally, overlay can be used to dim the space behind the modal to
     * emphasize its content.
     * 
     * @param idx               corresponding modal item index in the list of modals of given type
     * @param modal_type        type of the modal
     * @param modal_data        app-defined properties of the modal
     * @param action_handler    modal action request handler
     */
    renderOverlay(
        idx: number, 
        modal_type: string, 
        modal_data: IModalData, 
        action_handler?: ModalActionHandler
    ) {
        let onclose = modal_data.is_closable !== false ? () => action_handler(ModalAction.Escape) : null;

        return (
            <CSSTransition in out key={'o' + modal_type + idx} classNames='mdl' timeout={0} unmountOnExit>
                <Overlay on_close={onclose} />
            </CSSTransition>
        );
    }

    /**
     * Renders modal wrapped in a dialog box
     * 
     * @param idx               modal item index in the list of modals of given type
     * @param modal_type        type of the modal
     * @param modal_data        app-defined properties of the modal
     * @param content           modal content (textual or rendered if widget is required)
     * @param action_handler    modal action request handler
     */
    renderDialogModal(
        idx: number,
        modal_type: string,
        modal_data: IModalData,
        content: string | JSX.Element,
        action_handler?: ModalActionHandler
    ) {
        /** Modal app-defined properties converted to Dialog props */
        const dialog_props: DialogProps = {
            ...modal_data,
            ...modal_data.dialog,
            heading: i18next.t(modal_data.dialog.heading),
            label_accept: i18next.t(modal_data.dialog.label_accept),
            label_dismiss: i18next.t(modal_data.dialog.label_dismiss),
        };
        
        // Translate the content if possible
        content = typeof content === 'string' ? i18next.t(content) : content;

        return (
            <CSSTransition in out key={'m' + modal_type + idx} timeout={200} classNames="mdl" unmountOnExit>
                <DialogModal
                    size={modal_data.size}
                    width={modal_data.width}
                    height={modal_data.height}

                    {...dialog_props}

                    on_action={(action: ModalAction) => action_handler && action_handler(action)}
                >
                    {content}
                </DialogModal>
            </CSSTransition>
        )
    }

    /**
     * Renders pure modal 
     * 
     * @param idx           modal item index in the list of modals of given type
     * @param modal_type    type of the modal
     * @param props         app-defined properties of the modal
     * @param content       modal content (textual or rendered if widget is required)
     */
    private renderModal(idx: number, modal_type: string, props: ModalProps, content: string | JSX.Element) {
        content = typeof content === 'string' ? i18next.t(content) : content;

        return (
            <CSSTransition in out key={'m' + modal_type + idx} timeout={200} classNames="mdl" unmountOnExit>
                <Modal size={props.size} width={props.width} height={props.height}>
                    {content}
                </Modal>
            </CSSTransition>
        )
    }

    /**
     * Creates Nest for the {@link Modal} with given properties
     * 
     * If it's required to render the widget in the properties of the modal,
     * this method is used to generate its content.
     * 
     * Each Widget contains View as the part to be display, and each View
     * requires to be wrapped in the {@link Nest}, so this method returns the 
     * Nest element as the modal content.
     * 
     * @param modal_data app-defined properties of the modal
     */
    private renderNest(modal_data: IModalData): JSX.Element {
        /** Get the alias of the widget to initialize it */
        const widget_alias = modal_data.widget_alias;

        if (!(widget_alias in this.props.widgets)) {
            throw new Error(`Cannot resolve widget by alias ${widget_alias}`)
        }

        // Resolve the widget by its alias
        const widget = Object.assign({}, this.props.widgets[widget_alias]);

        const nest = (
            <Nest connector={widget.connector}
                lang={this.props.lang}
                view_type={widget.view_type}
                view_props={widget.view_props}
            />
        )

        return nest;
    }
}