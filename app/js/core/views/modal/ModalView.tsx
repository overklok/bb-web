import * as React from "react";

import {IViewProps, View} from "../../base/view/View";
import {CSSTransition, TransitionGroup} from "react-transition-group";
import ModalCompound from "./ModalCompound";
import {IModalData} from "../../datatypes/modal";

interface ModalViewProps extends IViewProps {
    modals: {[type: string]: IModalData[]};
    on_close?: (idx: number, modal_type: string) => void;
}

export default class ModalView extends View<ModalViewProps, null> {
    static defaultProps: ModalViewProps = {
        modals: {},
    }

    handleModalClose(idx: number, modal_type: string) {
        this.props.on_close && this.props.on_close(idx, modal_type);
    }

    render(): React.ReactNode {
        return (
            <React.Fragment>
                {Object.keys(this.props.modals).map((modal_type, i) =>
                    this.props.modals[modal_type].map((modal_data, idx) => {
                        return (
                            <ModalCompound
                                key={idx}
                                modal_type={modal_type}
                                modal_data={modal_data}
                                widgets={this.props.widgets} /* TODO: Remove */
                                is_closable={modal_data.is_closable}
                                on_close={() => this.handleModalClose(idx, modal_type)}
                            />
                        )
                    })
                )}
            </React.Fragment>
        )
    }
}