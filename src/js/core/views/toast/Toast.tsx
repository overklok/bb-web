import ToastTimer from "./ToastTimer";
import * as React from "react";
import {ColorAccent} from "../../helpers/styles";
import {useEffect, useState} from "react";

require("../../../../css/core/toast.less");
require("../../../../css/blocks/generic/btn.less");

/**
 * Props for {@link Toast}
 * 
 * @category Core.UI
 */
interface ToastProps {
    /** color accent of the toast */
    status: ColorAccent;
    /** toast content (React Components or plain text) */
    children: React.ReactNode;
    /** timeout handler (triggers if timeout is specified */
    on_close: () => void;
    /** toast title */
    title?: string;
    /** for non-zero values, specifies the time to call the timeout handler */
    timeout?: number;
    /** action button at the bottom */
    action?: { 
        /** button title */
        title: string, 
        /** button click handler */
        callback: Function
    };
}

/**
 * Floating stacked popup message interface
 * 
 * Shows a timer bar at the bottom if `timeout` prop is specified.
 * Can contain another React Component as well as plain text.
 * 
 * @see ToastProps
 * 
 * @category Core.UI
 * 
 * @component
 * @example
 * const voidfn = () => {}
 * 
 * return (
 *   <Toast status='warning' title='Sample Title' on_close={voidfn} action={{ title: 'Action', callback: voidfn }}>
 *      <p>Paragraph with <span style={{fontWeight: 'bold'}}>bold</span> text.</p>
 *   </Toast>
 * )
 */
export default function Toast(props: ToastProps) {
    const toast_ref: React.RefObject<HTMLDivElement> = React.createRef();
    const [is_paused, setPaused] = useState(false);

    /**
     * Calls timeout handler
     */
    const handleClose = () => {
        props.on_close && props.on_close();
    }

    /**
     * Handles mouse enter
     */
    const handleEnter = () => {
        // Pause the timer
        setPaused(true);
    }

    /**
     * Handles mouse leave
     */
    const handleLeave = () => {
        // Continue the timer
        setPaused(false);
    }

    // Hook on mount
    useEffect(() => {
        // Freeze the height to save size when the stack is full
        toast_ref.current.style.height = `${toast_ref.current.clientHeight}px`;
    });

    return (
        <div className={`toast toast_${props.status}`}
             onClick={handleClose}
             onMouseEnter={handleEnter}
             onMouseLeave={handleLeave}
             ref={toast_ref}
        >
            <div className="toast__section toast__section_darker">
                <span className='toast__title'>
                    {props.title}
                </span>
            </div>
            <div className="toast__section">
                {props.children}
            </div>
            {props.action && (
                <div className="toast__section">
                    <div className={`btn btn_sm btn_${props.status}`} onClick={() => props.action.callback()}>
                        {props.action.title}
                    </div>
                </div>
            )}
            <ToastTimer className="toast__timer"
                        on_finish={handleClose}
                        timeout={props.timeout}
                        color={props.status}
                        is_hidden={false}
                        is_paused={is_paused}
            />
        </div>
    )
}