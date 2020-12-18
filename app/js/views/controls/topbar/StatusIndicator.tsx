import * as React from "react";
import Portal from "../../../core/base/view/Portal";
import classNames from "classnames";

require('../../../../css/blocks/menu/popup.less');

interface IProps {
    status: 'connected' | 'waiting' | 'disconnected' | 'no-server';
}

interface IState {
    left: number;
    top: number;
}


export default class StatusIndicator extends React.Component<IProps, IState>{
    div_root: HTMLDivElement;
    private ref_popup: React.RefObject<HTMLDivElement>;
    private details: {[key: string]: [string, Function]};

    constructor(props: IProps) {
        super(props);

        this.state = {
            left: 0,
            top: 0
        };

        this.setRootRef = this.setRootRef.bind(this);

        this.ref_popup = React.createRef();

        this.details = {
            'connected':    ['Доска подключена',        this.renderContentConnected],
            'waiting':      ['Ожидание подключения...', this.renderContentWaiting],
            'disconnected': ['Доска отключена',         this.renderContentDisconnected],
            'no-server':    ['Невозможно подключиться', this.renderContentNoServer]
        }
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

        const [title, renderer] = this.details[this.props.status];

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
            'fa-check-circle text-success': this.props.status === 'connected',
            'fa-exclamation-circle text-warning': this.props.status === 'waiting',
            'fa-times-circle text-danger': this.props.status === 'disconnected',
            'fa-circle-notch text-default': this.props.status === 'no-server',
        });

        return (
            <div className={`indicator indicator_${color}`} ref={this.setRootRef}>
                <Portal>
                    <div className={`popup popup_${tail_side}`} style={{left: popup_left, top: popup_top}} ref={this.ref_popup}>
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
