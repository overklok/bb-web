import * as React from "react";
import classNames from "classnames";
import {Action, BooleanAction} from "../../Event";

interface IProps {

}

interface IState {
    active: boolean;
    items?: Array<[string, Action<any>, Function]>;
}

export default class TabMenu extends React.Component<IProps, IState> {
    private readonly onglobalclick: () => void;

    constructor(props: IProps) {
        super(props);

        this.state = {
            active: false,
            items: [] as Array<[string, Action<any>, Function]>,
        };

        this.setActive = this.setActive.bind(this);

        this.onglobalclick = () => this.setInactive();
    }

    setItems(items: Array<[string, Action<any>, Function]>) {
        this.setState({...this.state, items});
    }

    componentDidMount() {
        document.body.addEventListener("click", this.onglobalclick);
    }

    componentWillUnmount() {
        document.body.removeEventListener("click", this.onglobalclick);
    }

    render() {
        if (this.state.items.length === 0) return null;

        const btn_klasses = classNames({
           'ddmenu__btn': true,
           'ddmenu__btn_active': this.state.active,
        });

        const items_klasses = classNames({
            'ddmenu__items': true,
            'ddmenu__items_active': this.state.active
        });

        return (
            <div className='tab__menu ddmenu'>
                <div className={btn_klasses} onClick={this.setActive} />
                <ul className={items_klasses}>
                    {
                        this.state.items.map(([name, action_type, cb], index) => {
                            if (action_type === null) {
                                return <li key={index}><hr/></li>;
                            }

                            switch ((action_type as any).Alias) {
                                case BooleanAction.Alias:
                                    return <li key={index} onClick={() => {cb()}}>{`[B] ${name}`}</li>;
                                default:
                                    return <li key={index} onClick={() => {cb()}}>{name}</li>;
                            }
                        })
                    }
                </ul>
            </div>
        )
    }

    private setActive() {
        this.setState({active: true});
    }

    private setInactive() {
        this.setState({active: false});
    }
}