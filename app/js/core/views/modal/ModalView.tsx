import * as React from "react";
import Modal from "./Modal";

import {IViewOptions, IViewProps, IViewState, View} from "../../base/view/View";
import DialogModal from "./DialogModal";
import Nest from "../../base/view/Nest";

export interface IModal {
    heading?: string;
    hint?: string;
    content?: string;
    widget_alias?: string;
    is_dialog?: boolean;
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
        let modals_new = [...this.state.modals];

        modals_new.push(modal_data);

        this.setState({
            modals: modals_new
        });
    }

    render(): React.ReactNode {
        return this.state.modals.map((modal_data, i) => {
            const {is_dialog, heading, hint, widget_alias} = modal_data;

            let content: string | JSX.Element = modal_data.content;

            if (widget_alias) {
                content = this.renderNest(widget_alias);
            }

            if (is_dialog) {
                return (
                    <DialogModal key={i} onClose={() => this.closeModal(i)} heading={heading} hint={hint}>
                        {content}
                    </DialogModal>
                )
            } else {
                return (
                    <Modal key={i} onClose={() => this.closeModal(i)}>
                        {content}
                    </Modal>
                )
            }
        });
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
            />
        )
    }

    private closeModal(index: number) {
        let modals_new = [...this.state.modals];

        modals_new.splice(index);

        this.setState({
            modals: modals_new
        });
    }
}