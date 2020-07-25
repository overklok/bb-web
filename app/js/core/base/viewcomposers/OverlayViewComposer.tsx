import * as React from "react";

interface IProps {
    children: JSX.Element[]
}

interface IState {}


export default class OverlayViewComposer extends React.Component<IProps, IState> {
    render() {
        const {children} = this.props;

        return (
            {children}
        )
    }
};