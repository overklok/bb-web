import * as React from "react";
import {View, IViewProps, IViewState} from "../../base/View";
import {AbstractEvent} from "../../base/Event";

export class ClickEvent extends AbstractEvent<ClickEvent> {
    public readonly posX: number;
    public readonly posY: number;
}

export default class TestView extends View {
    constructor(props: IViewProps) {
        super(props);
    }

    test() {

    }

    render() {
        this.emit(new ClickEvent({
           posX: 0,
           posY: 0
        }));

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