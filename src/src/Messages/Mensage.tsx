import React, { Component } from 'react';
import './Mensage.css'

export class IMessage {
    public user: string;
    public message: string;
    public mymessage: boolean;

    constructor(_user: string, _message: string, _mymessage = false) {
        this.user = _user;
        this.message = _message;
        this.mymessage = _mymessage;
    }
}

interface IProps {
    message: IMessage;
}

interface IState {

}

class Message extends Component<IProps, IState> {

    render() {
        return (
            <div className="message" style={(this.props.message.mymessage) ? { float: "right" } : { float: "left" }}>
                <h3>{this.props.message.user}</h3>
                {this.props.message.message}
            </div>
        );
    }
}

export default Message;
