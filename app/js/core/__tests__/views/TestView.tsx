import * as React from "react";
import {View, IViewProps, IViewState} from "../../base/View";
import {AbstractEvent} from "../../base/Event";

export class ClickEvent extends AbstractEvent {
    static readonly alias = 'click';
}

export default class TestView extends View {
    constructor(props: IViewProps) {
        super(props);
    }

    test() {

    }

    render() {
        this.emit(new ClickEvent());

        return (
            <span>
                Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test
                Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test
                Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test
                Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test
                Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test
                Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test
                Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test
                Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test
                Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test
            </span>
        )
    }
}