import * as React from "react";
import {View, IViewProps} from "../../base/View";

class IViewState {
    text: string;
}


export default class TestView extends View<IViewProps, IViewState> {
    constructor(props: IViewProps) {
        super(props);

        this.state = {
            text: 'foo'
        }

        console.log('reset state')
    }

    setText(text: string) {
        this.setState({text});
    }

    render() {
        super.render();

        console.log("Render TestView", this.state.text);

        return (
            <span>
                {this.state.text}
            </span>
        )
    }
}