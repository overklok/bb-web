import * as React from "react";


export default class Combolist extends React.Component<{}, {}> {
    render() {
        return (
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
        );
    }
}