import * as React from "react";
import ILayoutPane from "../interfaces/ILayoutPane";

interface IProps {
    panes?: ILayoutPane[],
    orientation: string
}

interface IState {
    mode_name: string
}

export default class Pane extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            mode_name: 'default'
        }
    }

    render() {
        return (
            <div></div>
        );
    }
}