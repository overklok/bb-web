import React from "react";
import classNames from "classnames";

import {IViewProps, IViewState, View} from "../../core/base/view/View";
import "../../../css/testkit.less";
import Breadboard from "../../utils/breadboard/Breadboard";

interface IProps {
    title: string;
    type: string;
    extra?: any;
    quantity: number;
    onQuantityChange?: (q: number) => void;
}

interface IState {}

export class TestkitItemComponent extends React.Component<IProps, IState>{
    private ref: React.RefObject<HTMLDivElement> = React.createRef();

    componentDidMount() {
        Breadboard.drawPlate(this.ref.current, this.props.type, this.props.extra);
    }

    onQuantityChange(e: React.ChangeEvent<HTMLInputElement>) {
        this.props.onQuantityChange && this.props.onQuantityChange(Number(e.target.value));
    }

    render() {
        const classList = classNames({
            'testkit-item': true,
            'testkit-item_active': this.props.quantity > 0
        });

        return (
            <div className={classList}>
                <div className='testkit-item__plate' ref={this.ref} />
                <p className='testkit-item__description'>
                    {this.props.title}
                </p>
                <input className='testkit-item__input'
                   type="number"
                   min={0}
                   max={99}
                   value={this.props.quantity}
                   onChange={e => this.onQuantityChange(e)}
                />
            </div>
        );
    }
}

type TestkitItem = {title: string, type: string, extra?: any, quantity: number};

interface TestkitViewState extends IViewState {
    quantities: number[];
}

interface TestkitViewOptions {
    items: TestkitItem[];
    qtys_initial?: number[];
}

export default class TestkitView extends View<TestkitViewOptions, TestkitViewState> {
    static defaultOptions: TestkitViewOptions = {
        items: [],
        qtys_initial: []
    }

    constructor(props: IViewProps<TestkitViewOptions>) {
        super(props);

        this.state = {
            quantities: this.options.items.map((v, i) =>
                this.options.qtys_initial[i] != null ? this.options.qtys_initial[i] : v.quantity
            )
        }
    }

    public getItemQuantities(): number[] {
        return [...this.state.quantities];
    }

    public setItemQuantity(key: number, quantity: number) {
        const qtys_new = [...this.state.quantities];

        if (key < 0 || key > qtys_new.length) {
            throw new Error("Invalid item key");
        }

        qtys_new[key] = quantity;

        this.setState({quantities: qtys_new});
    }

    public render(): React.ReactNode {
        const {items} = this.options;

        return (
            <div className='testkit'>
                <h1 className='testkit__heading'>Выберите компоненты</h1>
                <p className='testkit__subheading'>
                    Эти компоненты будут использоваться для генерации тестовых примеров. <br/>
                    Укажите то количество плашек, которое имеется в Вашем наборе.
                </p>

                <div className='testkit__list'>
                    {items.map((item, i) => {
                        return <TestkitItemComponent
                            title={item.title}
                            type={item.type}
                            extra={item.extra}
                            key={i}
                            quantity={this.state.quantities[i]}
                            onQuantityChange={(q: number) => this.setItemQuantity(i, q)}
                        />
                    })}
                </div>
            </div>
        );
    }
}