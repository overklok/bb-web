import * as React from "react";
import classNames from "classnames";

interface MCMProps {
    caption: string;
    visible: boolean;
    btn_pos_x: number;
    btn_pos_y: number;
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

        const klasses = classNames({
            'mission': true,
            'mission_visible': this.props.visible
        });

        const klasses_head = classNames({
            'mission__head': true,
            'mission__head_reversed': reverse_head,
        })

        return (
            <div className={klasses} style={{left: pos_x, top: pos_y}} ref={this.ref_cont}>
                <div className={klasses_head}>
                    <div className="mission__dropcap">
                        <div className="cask" ref={this.ref_cask}>
                            {this.props.caption}
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
                    <ul className='combolist'>
                        <li className='combolist__item cl-item'>
                            <div className="cl-item__caption">
                                Exercise 1
                            </div>
                            <div className="cl-item__context cl-context">
                                <div className="cl-context__action">

                                </div>
                            </div>
                        </li>
                        <li className='combolist__item cl-item'>
                            <div className="cl-item__caption">
                                Exercise 2
                            </div>
                            <div className="cl-item__context cl-context">
                                <div className="cl-context__action">

                                </div>
                            </div>
                        </li>
                        <li className='combolist__item cl-item'>
                            <div className="cl-item__caption">
                                Exercise 3
                            </div>
                            <div className="cl-item__context cl-context">
                                <div className="cl-context__action">

                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        )
    }
}