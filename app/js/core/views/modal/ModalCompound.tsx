import Modal, {IModalProps, Overlay} from "./Modal";
import * as React from "react";
import {IDialogProps} from "./Dialog";
import DialogModal from "./DialogModal";
import Nest from "../../base/view/Nest";
import {Widget} from "../../services/interfaces/IViewService";
import {IModalData} from "../../datatypes/modal";

interface ModalCompoundProps {
    modal_type: string;
    modal_data: IModalData;
    widgets: {[key: string]: Widget<any>};

    is_closable: boolean;
    on_close: Function;
}

export default class ModalCompound extends React.Component<ModalCompoundProps, null> {
    static defaultProps = {
        is_closable: true
    }

    render() {
        let content: string | JSX.Element = this.props.modal_data.content;

        if (this.props.modal_data.widget_alias) {
            content = this.renderNest();
        }

        console.log(this.props.modal_data);

        if (this.props.modal_data.dialog) {
            return [
                this.renderOverlay(),
                this.renderDialogModal(this.props.modal_type, this.props.modal_data, content)
            ];
        } else {
            return [
                this.renderOverlay(),
                this.renderModal(this.props.modal_data, content)
            ];
        }
    }

    handleClose() {
        this.props.on_close && this.props.on_close();
    }

    handleCloseRequest() {
        if (this.props.is_closable) {
            this.handleClose();
        }
    }

    renderOverlay() {
        return (
            <Overlay key={'o'} onClose={() => this.handleCloseRequest()}/>
        );
    }

    renderDialogModal(modal_type: string, modal_data: IModalData, content: string | JSX.Element) {
        const dialog_props: IDialogProps = {...modal_data, ...modal_data.dialog};

        return (
            <DialogModal
                key={'dm'}
                size={modal_data.size}
                width={modal_data.width}
                height={modal_data.height}
                on_close={() => this.handleClose()}
                {...dialog_props}
            >
                {content}
            </DialogModal>
        )
    }

    private renderModal(props: IModalProps, content: string | JSX.Element) {
        return (
            <Modal key={'m'} size={props.size} width={props.width} height={props.height}>
                {content}
            </Modal>
        )
    }

    private renderNest(): JSX.Element {
        const widget_alias = this.props.modal_data.widget_alias;

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
                  close_request={() => this.handleClose()}
            />
        )
    }
}