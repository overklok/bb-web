import * as React from "react";

export interface IVCProps {
    children: JSX.Element[];
    refCallback?: (e: HTMLDivElement) => {};
} 

export interface IVCState {
    
}

export default class ViewComposer<P extends IVCProps, S extends IVCState> extends React.Component<P, S> {
    constructor(props: P) {
        super(props);
    }
};