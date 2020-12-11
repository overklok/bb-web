import * as React from "react";

import Portal from "../../../core/base/view/Portal";
import MissionContextMenu from "./MissionContextMenu";
import {clamp} from "../../../core/helpers/functions";

require('../../../../css/blocks/menu/mission.less');
require('../../../../css/blocks/menu/combolist.less');

interface MissionLiProps {
    caption: string;
    progress: number;
}

interface MissionLiState {
    ctxmenu_active: boolean;
    pos_x: number;
    pos_y: number;
}

export default class MissionLi extends React.Component<MissionLiProps, MissionLiState> {
    private readonly ref_root: React.RefObject<HTMLDivElement>;

    constructor(props: MissionLiProps) {
        super(props);

        this.state = {
            ctxmenu_active: false,
            pos_x: undefined,
            pos_y: undefined,
        };

        this.ref_root = React.createRef();

        this.handleClick                = this.handleClick.bind(this);
        this.handleContextMenu          = this.handleContextMenu.bind(this);
        this.handleContextMenuGlobal    = this.handleContextMenuGlobal.bind(this);
    }

    componentDidMount() {
        document.addEventListener("contextmenu", this.handleContextMenuGlobal);
    }

    componentWillUnmount() {
        document.removeEventListener("click", this.handleClick);
        document.removeEventListener("contextmenu", this.handleContextMenuGlobal);
    }

    handleClick(e: MouseEvent) {
        if (this.state.ctxmenu_active) {
            this.setState({ctxmenu_active: false});
            document.removeEventListener("click", this.handleClick);
        }

        console.log('hclk', e.target)
    }

    handleContextMenu(e: React.MouseEvent) {
        // if (this.state.ctxmenu_active) return;
        //
        // e.preventDefault();
        //
        // document.addEventListener("click", this.handleClick);
        //
        // const {top, left} = this.ref_root.current.getBoundingClientRect();
        //
        // this.setState({
        //     pos_x: left,
        //     pos_y: top,
        //     ctxmenu_active: true
        // });
    }

    handleContextMenuGlobal(e: MouseEvent) {
        // if (!this.state.ctxmenu_active) return;
        //
        // if (e.target !== this.ref_root.current) {
        //     this.setState({ctxmenu_active: false});
        //     document.removeEventListener("click", this.handleClick);
        // }
    }

    render() {
        const cask_style = {
            bottom: -(100 - clamp(0, 100, this.props.progress)) + '%'
        }

        return (
            <li className="pager__item cask cask_active">
                <div className="cask__progress cask__progress_wavy" style={cask_style}>
                    <div className="wavefront">
                        <div className="wavefront__wave wavefront__wave_left"></div>
                        <div className="wavefront__wave wavefront__wave_right"></div>
                    </div>

                    <div className="wavefront wavefront_half">
                        <div className="wavefront__wave wavefront__wave_left wavefront__wave_half"></div>
                        <div className="wavefront__wave wavefront__wave_right wavefront__wave_half"></div>
                    </div>
                </div>

                <div className="cask__content" ref={this.ref_root} onContextMenu={this.handleContextMenu}>
                    {this.props.caption}
                </div>

                <Portal>
                    <MissionContextMenu caption={this.props.caption}
                                        visible={this.state.ctxmenu_active}
                                        btn_pos_x={this.state.pos_x}
                                        btn_pos_y={this.state.pos_y}
                    />
                </Portal>
            </li>
        )
    }
}

