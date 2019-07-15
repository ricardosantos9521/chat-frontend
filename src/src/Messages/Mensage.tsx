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
    userBefore: String;
}

interface IState {

}

class Message extends Component<IProps, IState> {

    hideUserName(user: string): boolean {
        if (this.props.userBefore === user) {
            return true;
        }

        return false;
    }

    render() {
        return (
            <div className="boxmessage" style={(this.props.message.mymessage) ? { float: "right" } : { float: "left" }}>
                <div className="usermessage" hidden={this.hideUserName(this.props.message.user)}>
                    {this.props.message.user}
                </div>
                <div className="message">
                    {this.props.message.message}
                </div>
            </div>
        );
    }
}

export default Message;
