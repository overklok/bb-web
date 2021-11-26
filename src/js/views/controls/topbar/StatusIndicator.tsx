import * as React from "react";
import Portal from "../../../core/base/view/Portal";
import classNames from "classnames";

import i18next from 'i18next';

const TIME_SHOW = 3000;

require('../../../../css/blocks/menu/indicator.less');
require('../../../../css/blocks/menu/popup.less');

interface IProps {
    status: ConnectionStatus;
}

interface IState {
    left: number;
    top: number;
    is_popup_visible: boolean;
}

export const enum ConnectionStatus {
    Unknown,
    Disconnected,
    Waiting,
    BoardConnected,
    BoardSearching,
    BoardDisconnected
}

/**
 * @category Views
 * @subcategory Controls
 */
export default class StatusIndicator extends React.Component<IProps, IState>{
    div_root: HTMLDivElement;
    private readonly ref_popup: React.RefObject<HTMLDivElement>;
    private readonly details: {[key: string]: [string, string, Function]};
    private show_timeout: NodeJS.Timeout;

    constructor(props: IProps) {
        super(props);

        this.state = {
            is_popup_visible: this.props.status !== ConnectionStatus.BoardConnected,
            left: 0,
            top: 0
        };

        this.setRootRef = this.setRootRef.bind(this);
        this.showPopup  = this.showPopup.bind(this);
        this.disablePopupVisibility = this.disablePopupVisibility.bind(this);
        this.updatePopupPosition = this.updatePopupPosition.bind(this);

        this.ref_popup = React.createRef();

        this.details = {
            [ConnectionStatus.Unknown]:           ['default', i18next.t('main:board.connection.unknown.title'),               (): null => null],
            [ConnectionStatus.Waiting]:           ['warning', i18next.t('main:board.connection.waiting.title'),               this.renderWaiting],
            [ConnectionStatus.Disconnected]:      ['default', i18next.t('main:board.connection.no_core.title'),               this.renderNoCore],
            [ConnectionStatus.BoardConnected]:    ['success', i18next.t('main:board.connection.board_connected.title'),       this.renderConnected],
            [ConnectionStatus.BoardDisconnected]: ['danger',  i18next.t('main:board.connection.board_disconnected.title'),    this.renderDisconnected]
        }
    }

    setRootRef(element: HTMLDivElement) {
        if (!element) return;

        this.div_root = element;

        this.updatePopupPosition();
    }

    componentDidMount() {
        if (this.state.is_popup_visible) {
            this.show_timeout = global.setTimeout(this.disablePopupVisibility, TIME_SHOW);
        }

        window.addEventListener('resize', this.updatePopupPosition);
    }

    componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any) {
        if (prevProps.status !== this.props.status) {
            clearTimeout(this.show_timeout);

            this.setState({is_popup_visible: true});

            this.show_timeout = global.setTimeout(this.disablePopupVisibility, TIME_SHOW);
        }
    }

    componentWillUnmount() {
        clearTimeout(this.show_timeout);
        window.removeEventListener('resize', this.updatePopupPosition);
    }

    disablePopupVisibility() {
        this.setState({is_popup_visible: false});
    }

    showPopup() {
        clearTimeout(this.show_timeout);

        this.setState({is_popup_visible: true});

        this.show_timeout = global.setTimeout(this.disablePopupVisibility, TIME_SHOW);
    }

    updatePopupPosition() {
        const {top, left} = this.div_root.getBoundingClientRect();
        this.setState({top, left});
    }

    render() {
        const [color, title, renderer] = this.details[this.props.status];

        let popup_left = 0, popup_top = 0;
        let tail_side = 'left';

        if (this.ref_popup.current) {
            const {width: g_width} = document.body.getBoundingClientRect();
            const {width: popup_width} = this.ref_popup.current.getBoundingClientRect();
            const {width: root_width, height: root_height} = this.div_root.getBoundingClientRect();

            const tail_left = parseInt(
                window.getComputedStyle(this.ref_popup.current, ':before').left
            );

            const tail_bbw = parseInt(
                window.getComputedStyle(this.ref_popup.current, ':before').borderBottomWidth
            );

            if (g_width - this.state.left > popup_width) {
                popup_left = this.state.left - tail_left - tail_bbw / 2;
            } else {
                popup_left = this.state.left - popup_width + root_width + 8;
                tail_side = 'right';
            }

            popup_top = this.state.top + root_height;
        }

        const icon_klasses = classNames({
            'fas': true,
            'fa-check-circle text-success':         this.props.status === ConnectionStatus.BoardConnected,
            'fa-exclamation-circle text-warning':   this.props.status === ConnectionStatus.Waiting,
            'fa-times-circle text-danger':          this.props.status === ConnectionStatus.BoardDisconnected,
            'fa-circle-notch text-default':         this.props.status === ConnectionStatus.Disconnected,
        });

        const popup_klasses = classNames({
            'popup': true,
            'popup_left': tail_side === 'left',
            'popup_right': tail_side === 'right',
            'popup_visible': this.state.is_popup_visible
        });

        return (
            <div className={`indicator indicator_${color}`} ref={this.setRootRef} onClick={this.showPopup}>
                <Portal>
                    <div className={popup_klasses}
                         style={{left: popup_left, top: popup_top}}
                         ref={this.ref_popup}
                    >
                        <div className="popup__head">
                            <span className="popup__dropcap">
                                <i className={icon_klasses} />
                            </span>
                            <div className="popup__title">{title}</div>
                        </div>
                        <div className="popup__body">
                            {renderer()}
                        </div>
                    </div>
                </Portal>
            </div>
        )
    }

    renderConnected()        {return <p>{i18next.t('main:board.connection.board_connected.content')}</p>}
    renderDisconnected()     {return <p>{i18next.t('main:board.connection.board_disconnected.content')}</p>}
    renderWaiting(): void    {return null}
    renderNoCore()           {return <p>{i18next.t('main:board.connection.no_core.content')}</p>}
}
