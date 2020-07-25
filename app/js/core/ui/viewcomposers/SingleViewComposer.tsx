import * as React from "react";

interface IProps {
    children: JSX.Element[]
}

interface IState {}


export default class SingleViewComposer extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
    }

    render() {
        const {children} = this.props;

        return children;
    }
};