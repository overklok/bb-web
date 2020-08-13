import React from "react";
import {IViewOptions, IViewState, View} from "../../core/base/view/View";

type TestkitItem = {title: string, type: string};

interface TestkitViewState extends IViewState {
    items: TestkitItem[];
    keys_active: number[];
}

interface TestkitItemComponentProps {
    title: string,
    checked: boolean
}

export function TestkitItemComponent(props: TestkitItemComponentProps) {
    return <input
        type='checkbox'
        title={props.title}
        checked={props.checked}
    />
}

export default class TestkitView extends View<IViewOptions, TestkitViewState> {
    setActive(keys: number[]) {
        this.setState({keys_active: keys})
    }

    setItems(items: TestkitItem[]) {
        this.setState({items})
    }

    render(): React.ReactNode {
        const {items} = this.state;

        return items.map((item, i) => {
            return <TestkitItemComponent title={item.title} key={i} checked={i in this.state.keys_active} />
        });
    }
}