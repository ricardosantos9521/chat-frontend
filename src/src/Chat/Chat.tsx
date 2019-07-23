import React, { Component, FormEvent, ChangeEvent } from 'react';
import './Chat.css';
import { IMessage } from '../Messages/Mensage';
import off from './notifications_off.png';
import on from './notifications_on.png';
import Messages from '../Messages/Mensages';
import SignalRService from '../SignalR/SignalRService';

interface IProps {
}

interface IState {
    disable: boolean;
    user: string;
    message: string;
    messages: Array<IMessage>;
    users: number;
    notificationsOff: boolean;
}

class Chat extends Component<IProps, IState> {

    userInput = React.createRef<HTMLInputElement>();

    constructor(_props: any) {
        super(_props);

        if (localStorage.getItem("notificationsOff") === undefined || Notification.permission === "denied") {
            localStorage.setItem("notificationsOff", "true");
        }

        this.state = {
            disable: true,
            user: "",
            message: "",
            messages: [],
            users: 0,
            notificationsOff: (localStorage.getItem("notificationsOff") === "true") ? true : false
        }

        SignalRService.registerOnConnected(this.onConnectionConnected.bind(this));
        SignalRService.registerMessageReceived(this.addMessage.bind(this));
        SignalRService.registerUsersChange((numberUsers: number) => {
            this.setState({ users: numberUsers })
        });
        SignalRService.registerOnClose(this.onCloseConnection.bind(this));

        this.send = this.send.bind(this);
        this.updateUser = this.updateUser.bind(this);
        this.updateMessage = this.updateMessage.bind(this);
        this.requestNotifications = this.requestNotifications.bind(this);
    }

    onConnectionConnected() {
        this.setState({ disable: false });
    }

    onCloseConnection() {
        this.setState({ disable: true, users: 0 });
        this.addMessage("admin", "We are trying to reconnect!");
    }

    requestNotifications() {
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
            this.setState({ notificationsOff: true });
            localStorage.setItem("notificationsOff", "true");
            return;
        }
        else if (Notification.permission === "denied") {
            alert("Please enable notifications on your browser for this site");
            this.setState({ notificationsOff: true });
            localStorage.setItem("notificationsOff", "true");
            return;
        }


        if (Notification.permission === "default" && this.state.notificationsOff) {
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    this.setState({ notificationsOff: false });
                    localStorage.setItem("notificationsOff", "false");
                }
                else if (permission === "denied") {
                    this.setState({ notificationsOff: true });
                    localStorage.setItem("notificationsOff", "true");
                }
            });
            return;
        }
        else if (Notification.permission === "granted") {
            let current: boolean = this.state.notificationsOff
            this.setState({ notificationsOff: !current });
            localStorage.setItem("notificationsOff", (!current).toString());
        }
    }

    sendNotification(user: string, message: string) {
        if (!this.state.notificationsOff && Notification.permission === "granted") {
            if (document.hidden === true) {
                navigator.serviceWorker.getRegistration()
                    .then((registration: ServiceWorkerRegistration | undefined) => {
                        if (registration !== undefined) {
                            registration.getNotifications({ tag: user }).then(function (notifications) {
                                registration.showNotification("New message in ChatTest!", { icon: 'icons/icon-192x192.png', body: user + ": " + message, badge: 'chat.png', tag: user });
                            });
                        }
                    });
            }
        }
    }

    addMessage(user: string, message: string, myMessage = false) {
        this.setState({ messages: [...this.state.messages, new IMessage(user, message, myMessage)] });
        if (!myMessage) {
            this.sendNotification(user, message);
        }
    }

    send(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (this.state.user !== "") {
            SignalRService.sendMessage(this.state.user, this.state.message)
            this.setState({ message: "" });
            this.addMessage(this.state.user, this.state.message, true);
        }
        else {
            alert("User cannot be empty!");
            if (this.userInput !== undefined && this.userInput.current !== null) {
                this.userInput.current.focus();
            }
        }
    }

    updateUser(e: ChangeEvent<HTMLInputElement>) {
        this.setState({ user: e.target.value });
    }

    updateMessage(e: ChangeEvent<HTMLInputElement>) {
        this.setState({ message: e.target.value });
    }

    render() {
        return (
            <div className="grid-container" >
                <div className="head1">
                    <div className="containerstate" onClick={this.requestNotifications}>
                        <img src={(this.state.notificationsOff) ? off : on} id="notificationimage" alt="notificationimage" />
                    </div>
                    <div className="title">
                        <h1>ChatTest</h1>
                    </div>
                    <div className="containerstate" onClick={e => SignalRService.connectSignalR(true)}>
                        <div className="hubstate" style={{ backgroundColor: (this.state.disable) ? "red" : "green" }} />
                    </div>
                </div>
                <div className="head2">
                    <div className="countusers">
                        Users: {this.state.users}
                    </div>
                    <div className="user">
                        <input type="text" value={this.state.user} onChange={this.updateUser} placeholder="User" ref={this.userInput} />
                    </div>
                </div>
                <Messages messages={this.state.messages} />
                <div className="bottom">
                    <form onSubmit={e => this.send(e)}>
                        <div className="formgrid">
                            <div className="bottominput">
                                <input type="text" value={this.state.message} disabled={this.state.disable} onChange={this.updateMessage} placeholder="New Message" />
                            </div>
                            <div className="bottombutton">
                                <button type="submit" disabled={this.state.disable || this.state.message === ""}>Send</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

export default Chat;
