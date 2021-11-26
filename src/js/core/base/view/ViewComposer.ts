import * as React from "react";

/**
 * Props for {@link ViewComposer}
 */
export interface IVCProps {
    children: JSX.Element[];
    refCallback?: (e: HTMLDivElement) => {};
} 

export interface IVCState {
    
}

/**
 * Combines multiple {@link View}s in such a way that they can be mounted in a single component.
 * 
 * It can compose the {@link View}s to display them simultaneously ({@link OverlayViewComposer})
 * or provide some controls to switch between them.
 * 
 * @category Core
 * @subcategory View
 */
export default class ViewComposer<P extends IVCProps, S extends IVCState> extends React.Component<P, S> {
    constructor(props: P) {
        super(props);
    }
};