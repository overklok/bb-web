import {ToastTimer} from "./ToastTimer";
import * as React from "react";
import {ColorAccent} from "../../helpers/styles";
import {useEffect, useState} from "react";

require("../../../../css/core/toast.less");

interface Props {
    index: number;
    status: ColorAccent;
    children: string|JSX.Element|JSX.Element[];
    on_close: () => void;
    title?: string;
    timeout?: number;
    action?: {title: string, callback: Function};
}

/**
 * @category Core
 *
 * @component
 * @example
 * return (
 *   <Toast index={0} status={'danger'} children={'test'} on_close={() => {}} />
 * )
 */
export function Toast(props: Props) {
    const toast_ref: React.RefObject<HTMLDivElement> = React.createRef();
    const [is_paused, setPaused] = useState(false);

    const handleClose = () => {
        props.on_close && props.on_close();
    }

    const handleEnter = () => {
        setPaused(true);
    }

    const handleLeave = () => {
        setPaused(false);
    }

    useEffect(() => {
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