import * as React from "react";
import Modal, {IModalProps, ModalSize, Overlay} from "./Modal";
import cloneDeep from "lodash/cloneDeep";

import {AllProps, IViewProps, IViewState, View} from "../../base/view/View";
import Nest from "../../base/view/Nest";
import {CSSTransition, TransitionGroup} from "react-transition-group";
import Dialog, {IDialogProps} from "./Dialog";

export interface IDialog {
    heading?: string;
    hint?: string;

    label_accept?: string;
    label_dismiss?: string;

    on_accept?: Function;
    on_dismiss?: Function;
}

export interface IModal {
    size?: ModalSize;
    width?: number|string;
    height?: number|string;

    dialog?: IDialog;
    content?: string;
    widget_alias?: string;

    is_closable?: boolean;
    on_close?: Function;
}

interface ModalViewState extends IViewState {
    modals: {[type: string]: IModal[]};
}

export default class ModalView extends View<IViewProps, ModalViewState> {
    constructor(props: AllProps<IViewProps>) {
        super(props);

        this.state = {
            modals: {}
        };
    }

    showModal(modal_data: IModal, type='default'): void {
        let modals_new = cloneDeep(this.state.modals);

        // set defaults
        if (modal_data.is_closable == null) {
            modal_data.is_closable = true;
        }

        if (!modals_new[type] || type != 'default') {
            // for non-default channels, only one modal at a time is allowed
            modals_new[type] = [];
            modals_new[type].push(modal_data);
        } else {
            modals_new[type].push(modal_data);
        }

        this.setState({
            modals: modals_new
        });
    }

    render(): React.ReactNode {
        return (
            <TransitionGroup component={null}>
                {Object.keys(this.state.modals).map((modal_type, i) =>
                    this.state.modals[modal_type].map((modal_data, i) => {
                        let content: string | JSX.Element = modal_data.content;

                        if (modal_data.widget_alias) {
                            content = this.renderNest(modal_type, i, modal_data.widget_alias);
                        }

                        if (modal_data.dialog) {
                            return [
                                this.renderOverlay(modal_type, i),
                                this.renderDialogModal(modal_type, i, modal_data, content)
                            ];
                        } else {
                            return [
                                this.renderOverlay(modal_type, i),
                                this.renderModal(i, modal_data, content)
                            ];
                        }
                    })
                )}
            </TransitionGroup>
        )
    }

    private renderOverlay(modal_type: string, key: number): JSX.Element {
        return (
            <CSSTransition key={'o' + key} classNames='mdl' timeout={0} unmountOnExit>
                <Overlay onClose={() => this.onCloseRequest(modal_type, key)}/>
            </CSSTransition>
        );
    }

    private renderDialogModal(modal_type: string, key: number, modal_data: IModal, content: string | JSX.Element) {
        const dialog_props: IDialogProps = {...modal_data, ...modal_data.dialog};

        return (
            <CSSTransition in out key={key} timeout={200} classNames="mdl" unmountOnExit>
                <Modal size={modal_data.size} width={modal_data.width} height={modal_data.height}>
                    <Dialog {...dialog_props} on_close={() => this.closeModal(modal_type, key)}>
                        {content}
                    </Dialog>
                </Modal>
            </CSSTransition>
        )
    }

    private renderModal(key: number, props: IModalProps, content: string | JSX.Element) {
        return (
            <CSSTransition in out key={key} timeout={200} classNames="mdl" unmountOnExit>
                <Modal size={props.size} width={props.width} height={props.height}>
                    {content}
                </Modal>
            </CSSTransition>
        )
    }

    private renderNest(modal_type: string, key: number, widget_alias: string) {
        if (!(widget_alias in this.props.widgets)) {
            throw new Error(`Cannot resolve widget by alias ${widget_alias}`)
        }

        const widget = Object.assign({}, this.props.widgets[widget_alias]);

        return (
            <Nest connector={widget.connector}
                  index={0}
                  label={widget.label}
                  view_type={widget.view_type}
                  view_props={widget.view_props}
                  close_request={() => this.closeModal(modal_type, key)}
            />
        )
    }

    private onCloseRequest(modal_type: string, index: number) {
        if (this.state.modals[modal_type][index].is_closable) {
            this.closeModal(modal_type, index);
        }
    }

    private closeModal(modal_type: string, index: number) {
        const on_close = this.state.modals[modal_type][index].on_close;

        let modals_new = cloneDeep(this.state.modals);

        modals_new[modal_type].splice(index);

        this.setState({
            modals: modals_new
        });

        on_close && on_close();
    }
}