import * as React from "react";
import {ErrorInfo} from "react";
import {ViewType} from "../../helpers/types";

require("~/js/css/core/error.less");

/**
 * Props for {@link ErrorBoundary}
 * 
 * @ignore
 */
interface ErrorBoundaryProps {
    view_type: ViewType<any, any>;
}

/**
 * State of {@link ErrorBoundary}
 * 
 * @ignore
 */
interface ErrorBoundaryState {
    error: Error;
    has_error: boolean;
}

/**
 * Displays fallback message when an error has occurred in the {@link View}
 * 
 * @ignore
 */
export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);

        this.state = {error: null, has_error: false};
    }

    static getDerivedStateFromError(error: Error) {
        // Update state so the next render will show the fallback UI.
        return {error, has_error: true};
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // You can also log the error to an error reporting service
        // console.error(error, errorInfo);
    }

    render() {
        if (this.state.has_error) {
            // You can render any custom fallback UI
            return <div className='error'>
                <div className="error__section error__section_darker">
                    <h2 className='error__heading'>Uncaught {this.state.error.name} in {this.props.view_type.name}</h2>
                </div>

                <div className="error__section error__section_dark">
                    <span className='error__subheading'>{this.state.error.message}</span>
                </div>
                <div className="error__section">
                    <code className='error__stacktrace'>
                        {this.state.error.stack}
                    </code>
                </div>
            </div>;
        }

        return this.props.children;
    }
}