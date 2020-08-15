import React from "react";
import {IViewOptions, IViewProps, IViewState, View} from "../../core/base/view/View";
import {ViewEvent} from "../../core/base/Event";

type TestkitItem = {title: string, type: string};

interface TestkitViewState extends IViewState {
    keys_active: number[];
}

interface TestkitItemComponentProps {
    title: string,
    checked: boolean
}

export function TestkitItemComponent(props: TestkitItemComponentProps) {
    return (
        <React.Fragment>
            <p>
                {props.title}
                <input type='checkbox' title={props.title} checked={props.checked}/>
            </p>
        </React.Fragment>
    )
}

interface TestkitViewOptions {
    items: TestkitItem[];
}

export default class TestkitView extends View<TestkitViewOptions, TestkitViewState> {
    static defaultOptions: TestkitViewOptions = {
        items: []
    }

    constructor(props: IViewProps<TestkitViewOptions>) {
        super(props);

        this.state = {
            keys_active: []
        }
    }

    setActive(keys: number[]) {
        this.setState({keys_active: keys})
    }

    render(): React.ReactNode {
        const {items} = this.options;

        console.log(items);

        return (
            <div className='testkit'>
                <p>Select components to use:</p>

                <div className='testkit__list'>
                    {items.map((item, i) => {
                        return <TestkitItemComponent title={item.title} key={i} checked={i in this.state.keys_active} />
                    })}
                </div>
            </div>
        );
    }
}