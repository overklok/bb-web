import * as React from "react";
import {View, IViewProps, IViewState} from "../../base/View";

export default class TestView extends View {
    constructor(props: IViewProps) {
        super(props);
    }

    test() {

    }

    render() {
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