import * as React from "react";
import {View} from "../../ui/View";
import classNames from "classnames";
import ViewConnector from "../../ui/ViewConnector";


interface IProps {
    connector: ViewConnector;

    view_type: typeof View;
    label: string;
    index: number;
}

interface IState {
    mounted: boolean;
}

export default class Nest extends React.Component<IProps, IState> {
    private readonly ref = React.createRef<HTMLDivElement>()

    constructor(props: IProps) {
        super(props);

        this.state = {
            mounted: false,
        };
    }

    componentDidMount() {
        this.setState({mounted: true});
    }

    render() {
        const SpecificView = this.props.view_type;

        // Список классов, которые должны использоваться в зависимости от свойств
        let klasses = classNames({
            'nest': true,
        });

        return (
            <div className={klasses} ref={this.ref}>
                <SpecificView
                    connector={this.props.connector}
                    ref_nest={this.ref}
                    mounted={this.state.mounted}
                />
            </div>
        )
    }
}