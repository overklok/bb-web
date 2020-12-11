import * as React from "react";
import classNames from "classnames";
import CaskProgress from "./CaskProgress";
import Combolist from "./Combolist";
import {CSSTransition} from "react-transition-group";

interface MCMProps {
    caption: string;
    visible: boolean;
    btn_pos_x: number;
    btn_pos_y: number;
    progress: number;
}

interface MCMState {
    corr_x: number;
    corr_y: number;
}

export default class MissionContextMenu extends React.Component<MCMProps, MCMState> {
    static defaultProps = {
        visible: false,
    }

    private readonly ref_cont: React.RefObject<HTMLDivElement>;
    private readonly ref_cask: React.RefObject<HTMLDivElement>;

    constructor(props: MCMProps) {
        super(props);

        this.ref_cont = React.createRef();
        this.ref_cask = React.createRef();

        this.state = {
            corr_x: 0,
            corr_y: 0
        }
    }

    render() {
        let reverse_head = false;

        let pos_x = 0, pos_y = 0;
        let dx = 0;

        if (this.ref_cont.current) {
            if (this.props.btn_pos_x) pos_x = this.props.btn_pos_x - dx;
            if (this.props.btn_pos_y) pos_y = this.props.btn_pos_y;

            const {width: g_width} = document.body.getBoundingClientRect();
            const {width: cont_width} = this.ref_cont.current.getBoundingClientRect();
            const {width: cask_width} = this.ref_cask.current.getBoundingClientRect();

            if (this.props.btn_pos_x && (this.props.btn_pos_x + cont_width > g_width)) {
                dx = cont_width - cask_width;
                reverse_head = true;
            }
        }

        if (this.props.btn_pos_x) pos_x = this.props.btn_pos_x - dx;
        if (this.props.btn_pos_y) pos_y = this.props.btn_pos_y;

        const klasses_head = classNames({
            'mission__head': true,
            'mission__head_reversed': reverse_head,
        });

        return (
            <CSSTransition in={this.props.visible} timeout={300}>
                <div className="mission" style={{left: pos_x, top: pos_y}} ref={this.ref_cont}>
                    <div className={klasses_head}>
                        <div className="mission__dropcap">
                            <div className="cask" ref={this.ref_cask}>
                                <CaskProgress percent={this.props.progress} simple={true} />

                                <div className="cask__content">
                                    {this.props.caption}
                                </div>
                            </div>
                        </div>
                        <div className="mission__brief">
                            <div className="mission__title">
                                Mission title
                            </div>
                            <div className="mission__subtitle">
                                Mission subtitle
                            </div>
                        </div>
                    </div>
                    <div className="mission__body">
                        <Combolist />
                    </div>
                </div>
            </CSSTransition>
        )
    }
}