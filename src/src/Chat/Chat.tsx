import React, { Component, FormEvent, ChangeEvent, MouseEvent } from 'react';
import './Chat.css';
import { HubConnectionBuilder, HubConnection, LogLevel, HubConnectionState } from '@aspnet/signalr';
import Message, { IMessage } from '../Messages/Mensage';

interface IProps {
}

interface IState {
    disable: boolean;
    user: string;
    message: string;
    messages: Array<IMessage>;
    users: number;
}

class Chat extends Component<IProps, IState> {

    private connection: HubConnection;
    private messageLength = 0;

    private users = 0;

    private userBefore: string = "";
    private user: string = "";

    private triedReconnect: number = 0;

    constructor(_props: any) {
        super(_props);

        this.state = {
            disable: true,
            user: "",
            message: "",
            messages: [],
            users: 0
        }

        this.connection = new HubConnectionBuilder()
            .withUrl("http://rics.synology.me/signalr/server/" + "/chat")
            .build();

        this.initializeSignalR();
        this.connectSignalR();

        this.send = this.send.bind(this);
        this.updateUser = this.updateUser.bind(this);
        this.updateMessage = this.updateMessage.bind(this);
        this.connectSignalR = this.connectSignalR.bind(this);
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

    componentDidUpdate() {
        if (this.state.messages.length > this.messageLength) {
            var div = document.getElementById("messages") as HTMLDivElement;
            (div.lastChild as HTMLDivElement).scrollIntoView();

            this.messageLength = this.state.messages.length;
        }
    }

    addMessage(user: string, message: string, mymessage = false) {
        this.setState({ messages: [...this.state.messages, new IMessage(user, message, mymessage)] });
        var div = document.getElementById("messages") as HTMLDivElement;
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
            input.focus();
        }
    }

    updateUser(e: ChangeEvent<HTMLInputElement>) {
        this.setState({ user: e.target.value });
    }

    updateMessage(e: ChangeEvent<HTMLInputElement>) {
        this.setState({ message: e.target.value });
    }

    messages() {
        this.userBefore = "";
        this.user = "";
        return (
            this.state.messages.map((m, ikey) => {
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
            <div className="grid-container">
                <div className="head1">
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
                <div className="messages" id="messages">
                    {
                        this.messages()
                    }
                </div>
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
