import * as React from "react";
import Portal from "../../../core/base/view/Portal";

require('../../../../css/blocks/menu/popup.less');

interface IProps {
    status: 'connected' | 'waiting' | 'disconnected' | 'no-server'
}

interface IState {
    left: number;
    top: number;
}


export default class StatusIndicator extends React.Component<IProps, IState>{
    div_root: HTMLDivElement;
    private ref_popup: React.RefObject<HTMLDivElement>;

    constructor(props: IProps) {
        super(props);

        this.state = {
            left: 0,
            top: 0
        };

        this.setRootRef = this.setRootRef.bind(this);

        this.ref_popup = React.createRef();
    }

    setRootRef(element: HTMLDivElement) {
        if (!element) return;

        this.div_root = element;

        const {top, left} = this.div_root.getBoundingClientRect();
        this.setState({top, left});
    }

    componentDidUpdate(prevProps: Readonly<null>, prevState: Readonly<null>, snapshot?: any) {

    }

    render() {
        const color = {
            'connected':    'success',
            'waiting':      'warning',
            'disconnected': 'danger',
            'no-server':    'default'
        }[this.props.status];

        let popup_left = 0, popup_top = 0;

        if (this.ref_popup.current) {
            const {width: g_width} = document.body.getBoundingClientRect();
            const {width: popup_width} = this.ref_popup.current.getBoundingClientRect();
            const {width: root_width, height: root_height} = this.div_root.getBoundingClientRect();

            if (g_width - this.state.left > popup_width) {
                popup_left = this.state.left - root_width;
            } else {
                popup_left = this.state.left - popup_width + root_width;
            }

            popup_top = this.state.top + root_height;
        }

        return (
            <div className={`indicator indicator_${color}`} ref={this.setRootRef}>
                <Portal>
                    <div className="popup" style={{left: popup_left, top: popup_top}} ref={this.ref_popup}>
                        popup-content
                    </div>
                </Portal>
            </div>
        )
    }
}
