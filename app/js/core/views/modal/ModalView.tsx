import * as React from "react";
import Modal, {IModalProps, ModalSize, Overlay} from "./Modal";
import {cloneDeep} from "lodash";

import {IViewOptions, IViewProps, IViewState, View} from "../../base/view/View";
import DialogModal, {IDialogModalProps} from "./DialogModal";
import Nest from "../../base/view/Nest";
import {CSSTransition, TransitionGroup} from "react-transition-group";

export interface IModal {
    heading?: string;
    hint?: string;
    content?: string;
    widget_alias?: string;
    is_dialog?: boolean;

    size?: ModalSize;
    width?: number|string;
    height?: number|string;
}

interface ModalViewState extends IViewState {
    modals: IModal[];
}

export default class ModalView extends View<IViewOptions, ModalViewState> {
    constructor(props: IViewProps<IViewOptions>) {
        super(props);

        this.state = {
            modals: []
        };
    }

    showModal(modal_data: IModal): void {
        let modals_new = cloneDeep(this.state.modals);

        modals_new.push(modal_data);

        this.setState({
            modals: modals_new
        });
    }

    render(): React.ReactNode {
        return (
            <TransitionGroup component={null}>
                {this.state.modals.map((modal_data, i) => {
                    const {is_dialog, widget_alias} = modal_data;

                    let content: string | JSX.Element = modal_data.content;

                    if (widget_alias) {
                        content = this.renderNest(widget_alias);
                    }

                    if (is_dialog) {
                        return [this.renderOverlay(i), this.renderDialogModal(i, modal_data, content)];
                    } else {
                        return [this.renderOverlay(i), this.renderModal(i, modal_data, content)];
                    }
                })}
            </TransitionGroup>
        )
    }

    private renderOverlay(key: number): JSX.Element {
        return (
            <CSSTransition key={'o' + key} classNames='mdl' timeout={0} unmountOnExit>
                <Overlay onClose={() => this.closeModal(key)}/>
            </CSSTransition>
        );
    }

    private renderDialogModal(key: number, props: IDialogModalProps, content: string | JSX.Element) {
        return (
            <CSSTransition in out key={key} timeout={400} classNames="mdl" unmountOnExit>
                <DialogModal onClose={() => this.closeModal(key)}
                             heading={props.heading} hint={props.hint}
                             size={props.size} width={props.width} height={props.height}
                >
                    {content}
                </DialogModal>
            </CSSTransition>
        )
    }

    private renderModal(key: number, props: IModalProps, content: string | JSX.Element) {
        return (
            <CSSTransition in out key={key} timeout={400} classNames="mdl" unmountOnExit>
                <Modal size={props.size} width={props.width} height={props.height}>
                    {content}
                </Modal>
            </CSSTransition>
        )
    }

    private renderNest(widget_alias: string) {
        if (!(widget_alias in this.props.widgets)) {
            throw new Error(`Cannot resolve widget by alias ${widget_alias}`)
        }

        const widget = Object.assign({}, this.props.widgets[widget_alias]);

        return (
            <Nest connector={widget.connector}
                  index={0}
                  label={widget.label}
                  view_type={widget.view_type}
                  view_options={widget.view_options}
            />
        )
    }

    private closeModal(index: number) {
        let modals_new = cloneDeep(this.state.modals);

        modals_new.splice(index);

        this.setState({
            modals: modals_new
        });
    }
}