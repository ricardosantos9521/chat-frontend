import { HubConnectionBuilder, HubConnection, HubConnectionState, HttpTransportType } from '@aspnet/signalr';


class SignalR {
    private _connection: HubConnection;

    private triedReconnect: number = 0;

    private event: Event = new Event('connected');

    constructor() {
        this._connection = new HubConnectionBuilder()
            .withUrl("/chat/server/chat", { transport: HttpTransportType.WebSockets })             //need to change header in inverse proxy on synology to support websockets
            .build();

        this._connection.serverTimeoutInMilliseconds = 60000;
        this._connection.keepAliveIntervalInMilliseconds = 30000;

        this._connection.onclose(() => {
            console.log("Connection close!");
        });

        this.connectSignalR();
    }

    connectSignalR(isInput: boolean = false) {
        if (this._connection.state == HubConnectionState.Disconnected && (isInput || this.triedReconnect < 4)) {
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
        addEventListener("connected", connected);
    }

    registerMessageReceived(addMessage: (user: string, message: string) => void) {
        this._connection.on('receive', (user: string, message: string) => {
            addMessage(user, message);
        });
    }

    sendMessage(user: string, message: string) {
        this._connection.invoke('Send', user, message);
    }

    registerUsersChange(usersChanged: (number: number) => void) {
        this._connection.on("users", (number: number) => {
            usersChanged(number);
        });
    }

    registerOnClose(close: () => void) {
        this._connection.onclose(() => {
            close();
        });
    }

}

const SignalRService = new SignalR();

export default SignalRService;