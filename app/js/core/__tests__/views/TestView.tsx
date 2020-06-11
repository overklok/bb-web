import * as React from "react";
import {View, IViewProps, IViewState} from "../../base/View";

interface IProps extends IViewProps {

}

interface IState extends IViewState {

}

export default class TestView extends View<IProps, IState> {
    constructor(props: IProps) {
        super(props);
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