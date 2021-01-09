import * as React from "react";
import Portal from "../../../core/base/view/Portal";
import classNames from "classnames";

const TIME_SHOW = 3000;

require('../../../../css/blocks/menu/indicator.less');
require('../../../../css/blocks/menu/popup.less');

interface IProps {
    status: BoardStatus;
}

interface IState {
    left: number;
    top: number;
    is_popup_visible: boolean;
}

export const enum BoardStatus {
    Default,
    Connected,
    Waiting,
    Disconnected,
    NoServer
}


export default class StatusIndicator extends React.Component<IProps, IState>{
    div_root: HTMLDivElement;
    private readonly ref_popup: React.RefObject<HTMLDivElement>;
    private readonly details: {[key: string]: [string, string, Function]};
    private show_timeout: NodeJS.Timeout;

    constructor(props: IProps) {
        super(props);

        this.state = {
            is_popup_visible: this.props.status !== BoardStatus.Connected,
            left: 0,
            top: 0
        };

        this.setRootRef = this.setRootRef.bind(this);
        this.showPopup  = this.showPopup.bind(this);
        this.disablePopupVisibility = this.disablePopupVisibility.bind(this);

        this.ref_popup = React.createRef();

        this.details = {
            [BoardStatus.Default]:      ['default',   'Проверка подключения...', (): null => null],
            [BoardStatus.Connected]:    ['success',   'Доска подключена',        this.renderContentConnected],
            [BoardStatus.Waiting]:      ['waiting',   'Ожидание подключения...', this.renderContentWaiting],
            [BoardStatus.Disconnected]: ['danger',    'Доска отключена',         this.renderContentDisconnected],
            [BoardStatus.NoServer]:     ['default',   'Невозможно подключиться', this.renderContentNoServer]
        }
    }

    setRootRef(element: HTMLDivElement) {
        if (!element) return;

        this.div_root = element;

        const {top, left} = this.div_root.getBoundingClientRect();
        this.setState({top, left});
    }

    componentDidMount() {
        if (this.state.is_popup_visible) {
            this.show_timeout = setTimeout(this.disablePopupVisibility, TIME_SHOW);
        }
    }

    componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any) {
        if (prevProps.status !== this.props.status) {
            clearTimeout(this.show_timeout);

            this.setState({is_popup_visible: true});

            this.show_timeout = setTimeout(this.disablePopupVisibility, TIME_SHOW);
        }
    }

    disablePopupVisibility() {
        this.setState({is_popup_visible: false});
    }

    showPopup() {
        clearTimeout(this.show_timeout);

        this.setState({is_popup_visible: true});

        this.show_timeout = setTimeout(this.disablePopupVisibility, TIME_SHOW);
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
            'fa-check-circle text-success':         this.props.status === BoardStatus.Connected,
            'fa-exclamation-circle text-warning':   this.props.status === BoardStatus.Waiting,
            'fa-times-circle text-danger':          this.props.status === BoardStatus.Disconnected,
            'fa-circle-notch text-default':         this.props.status === BoardStatus.NoServer,
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

    renderContentConnected()        {return <p>Теперь можно выполнять упражнения по электронике.</p>}
    renderContentWaiting(): void    {return null}
    renderContentDisconnected()     {return <p>Подключите доску, используя кабель USB.</p>}
    renderContentNoServer()         {return <p>Произошла внутренняя ошибка.</p>}
}
