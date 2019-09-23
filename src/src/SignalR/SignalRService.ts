import { HubConnectionBuilder, HubConnection, HubConnectionState, HttpTransportType, LogLevel } from '@aspnet/signalr';


class SignalR {
    private _connection: HubConnection;

    private triedReconnect: number = 0;

    private event: Event = new Event('connected');

    constructor() {
        this._connection = new HubConnectionBuilder()
            .withUrl("/chat/server/chat", { transport: HttpTransportType.WebSockets, logger: LogLevel.Debug, skipNegotiation: true })
            .withAutomaticReconnect()
            .build();

        this._connection.onclose(() => {
            console.log("Connection close!");
        });

        this.connectSignalR();
    }

    connectSignalR(isInput: boolean = false) {
        if (this._connection !== undefined && this._connection.state === HubConnectionState.Disconnected && (isInput || this.triedReconnect < 4)) {
            this.triedReconnect++;
            this._connection.start()
                .then(() => {
                    this.triedReconnect = 0;
                    dispatchEvent(this.event);
                    console.log("Connection connected!");
                })
                .catch(
                    () => {
                        setTimeout(() => {
                            console.log("Trying to connect!");
                            this.connectSignalR();
                        }, 15000);
                    }
                );
        }
    }

    registerOnConnected(connected: () => void) {
        window.addEventListener("connected", connected);
    }

    registerMessageReceived(addMessage: (user: string, message: string) => void) {
        if (this._connection !== undefined) {
            this._connection.on('receive', (user: string, message: string) => {
                addMessage(user, message);
            });

            return true;
        }
        return false;
    }

    sendMessage(user: string, message: string) {
        if (this._connection !== undefined) {
            this._connection.invoke('Send', user, message);
            return true;
        }
        return false;
    }

    registerUsersChange(usersChanged: (number: number) => void): boolean {
        if (this._connection !== undefined) {
            this._connection.on("users", (number: number) => {
                usersChanged(number);
            });

            return true;
        }
        return false;
    }

    registerOnClose(close: () => void): boolean {
        if (this._connection !== undefined) {
            this._connection.onclose(() => {
                close();
            });

            return true;
        }
        return false;
    }

}

const SignalRService = new SignalR();

export default SignalRService;