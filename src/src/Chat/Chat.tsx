import React, { Component, FormEvent, ChangeEvent } from 'react';
import './Chat.css';
import { HubConnectionBuilder, HubConnection, HubConnectionState, HttpTransportType } from '@aspnet/signalr';
import { IMessage } from '../Messages/Mensage';
import off from './notifications_off.png';
import on from './notifications_on.png';
import Messages from '../Messages/Mensages';

interface IProps {
}

interface IState {
    disable: boolean;
    user: string;
    message: string;
    messages: Array<IMessage>;
    users: number;
    notificationsoff: boolean;
}

class Chat extends Component<IProps, IState> {

    private connection: HubConnection;

    private triedReconnect: number = 0;

    private lastNotification: Notification | undefined = undefined;

    constructor(_props: any) {
        super(_props);

        this.state = {
            disable: true,
            user: "",
            message: "",
            messages: [],
            users: 0,
            notificationsoff: (Notification.permission === "granted") ? false : true
        }

        this.connection = new HubConnectionBuilder()
            .withUrl("/signalr/server/chat", { transport: HttpTransportType.WebSockets })             //need to change header in inverse proxy on synology to support websockets
            // .withHubProtocol(new MessagePackHubProtocol())
            .build();

        this.initializeSignalR();
        this.connectSignalR();

        this.send = this.send.bind(this);
        this.updateUser = this.updateUser.bind(this);
        this.updateMessage = this.updateMessage.bind(this);
        this.connectSignalR = this.connectSignalR.bind(this);
        this.requestNotifications = this.requestNotifications.bind(this);
    }

    initializeSignalR() {
        this.connection.on("receive", (user: string, message: string) => {
            this.addMessage(user, message);
        });

        this.connection.on("users", (number: number) => {
            this.setState({ users: number })
        });

        this.connection.onclose(() => {
            this.setState({ disable: true });
            this.setState({ users: 0 });
            this.addMessage("admin", "We are trying to reconnect!");

            setTimeout(() => {
                this.connectSignalR();
            }, 15000);
        });
    }


    connectSignalR(isInput: boolean = false) {
        if (this.connection.state == HubConnectionState.Disconnected && (isInput || this.triedReconnect < 4)) {
            this.triedReconnect++;
            this.connection.start()
                .then(
                    () => {
                        this.triedReconnect = 0;
                        this.setState({ disable: false })
                        console.log("connected");
                    })
                .catch(
                    () => {
                        setTimeout(() => {
                            this.connectSignalR();
                        }, 15000);
                    }
                );
        }
    }

    requestNotifications() {
        Notification.requestPermission().then((permission) => {
            if (permission == "granted") {
                this.setState({ notificationsoff: false });
            }
            else if (permission == "denied") {
                this.setState({ notificationsoff: true });
            }
        });
    }

    sendNotification(user: string, message: string) {
        if (Notification.permission === "granted") {
            if (document.hidden == true) {
                if (this.lastNotification != undefined) {
                    this.lastNotification.close();
                }
                this.lastNotification = new Notification("New message in ChatTest!", { icon: 'conversation.png', body: user + ": " + message });
            }
        }
    }

    addMessage(user: string, message: string, mymessage = false) {
        this.setState({ messages: [...this.state.messages, new IMessage(user, message, mymessage)] });
        var div = document.getElementById("messages") as HTMLDivElement;
        if (!mymessage) {
            this.sendNotification(user, message);
        }
    }

    sendmessage(user: string, message: string) {
        this.connection.invoke('Send', user, message);
    }

    send(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (this.state.user != "") {
            this.sendmessage(this.state.user, this.state.message);
            this.setState({ message: "" });
            this.addMessage(this.state.user, this.state.message, true);
        }
        else {
            alert("User cannot be empty!");
            var input = document.getElementById("userinput") as HTMLInputElement;
            if (input != undefined) input.focus();
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
            <div className="grid-container">
                <div className="head1">
                    <div className="containerstate" onClick={this.requestNotifications}>
                        <img src={(this.state.notificationsoff) ? off : on} id="notificationimage" />
                    </div>
                    <div className="title">
                        <h1>ChatTest</h1>
                    </div>
                    <div className="containerstate" onClick={e => this.connectSignalR(true)}>
                        <div className="hubstate" style={{ backgroundColor: (this.state.disable) ? "red" : "green" }} />
                    </div>
                </div>
                <div className="head2">
                    <div className="countusers">
                        Users: {this.state.users}
                    </div>
                    <div className="user">
                        <input type="text" value={this.state.user} onChange={this.updateUser} placeholder="User" id="userinput" />
                    </div>
                </div>
                <Messages messages={this.state.messages}/>
                <div className="bottom">
                    <form onSubmit={e => this.send(e)}>
                        <div className="formgrid">
                            <div className="bottominput">
                                <input type="text" value={this.state.message} disabled={this.state.disable} onChange={this.updateMessage} placeholder="New Message" />
                            </div>
                            <div className="bottombutton">
                                <button type="submit" disabled={this.state.disable || this.state.message == ""}>Send</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

export default Chat;
