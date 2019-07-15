import React, { Component } from 'react';
import './Mensages.css'
import Message, { IMessage } from './Mensage';

interface IProps {
    messages: Array<IMessage>;
}

interface IState {

}

class Messages extends Component<IProps, IState> {

    private userBefore: string = "";
    private user: string = "";
    private messageLength = 0;

    constructor(props: IProps) {
        super(props);
        window.onresize = () => {
            this.scrollToEnd();
        }
    }

    componentDidUpdate() {
        if (this.props.messages.length > this.messageLength) {
            this.scrollToEnd();
            this.messageLength = this.props.messages.length;
        }
    }

    scrollToEnd() {
        var div = document.getElementById("messages") as HTMLDivElement;
        if (div !== null && div.lastChild !== null) {
            var lastChild = div.lastChild as HTMLDivElement;
            if (lastChild !== null) {
                lastChild.scrollIntoView();
            }
        }
    }

    messages() {
        this.userBefore = "";
        this.user = "";
        return (
            this.props.messages.map((m, ikey) => {
                this.userBefore = this.user;
                this.user = m.user;
                return (
                    <Message message={m} key={ikey} userBefore={this.userBefore} />
                );
            })
        );
    }

    render() {
        return (
            <div className="messages" id="messages">
                {
                    this.messages()
                }
            </div>
        );
    }
}

export default Messages;
