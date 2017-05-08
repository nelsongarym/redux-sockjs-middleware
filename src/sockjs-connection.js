import SockJS from 'sockjs-client';
import Stomp from 'stompjs/lib/stomp.min.js';

class SockJsConnection {

    constructor(baseUri, username, password, messageHandler) {
        this.baseUri = baseUri;
        this.username = username;
        this.password = password;
        this.messageHandler = messageHandler;
        this.Connection = null;
        this.isConnected = false;
        this.reconnectInterval = 250;
        this.Subscriptions = {};
        this.onClientSubscribed = this.onClientSubscribed.bind(this);
        this.onClientUnsubscribed = this.onClientUnsubscribed.bind(this);
        this.onClientConnected = this.onClientConnected.bind(this);
        this.onClientError = this.onClientError.bind(this);
        this.onClientDisconnected = this.onClientDisconnected.bind(this);
        this.resetReconnectInterval = this.resetReconnectInterval.bind(this);
        this.connect = this.connect.bind(this);
        this.subscribe = this.subscribe.bind(this);

        this.connect();
    }

    onClientConnected() {
        this.resetReconnectInterval();
        this.isConnected = true;
        const endpoints = Object.keys(this.Subscriptions);
        endpoints.forEach(function (endpoint) {
            this.Subscriptions[endpoint].subscription = this.Connection.subscribe(endpoint, this.messageHandler);
        }, this);
        console.debug('SockJS Connected');
    }

    onClientError(err) {
        this.isConnected = false;
        console.error(err);
        setTimeout(() => {
            if (this.reconnectInterval <= 60000) {
                this.reconnectInterval *= 2;
            }
            this.connect();
        }, this.reconnectInterval);
    }

    onClientDisconnected() {

    }

    onClientSubscribed() {

    }

    onClientUnsubscribed() {

    }

    resetReconnectInterval() {
        this.reconnectInterval = 250;
    }

    connect() {
        const ws = new SockJS(this.baseUri);
        this.Connection = Stomp.Stomp.over(ws);
        this.Connection.heartbeat.incoming = 0;
        this.Connection.heartbeat.outgoing = 0;
        this.Connection.connect(this.username, this.password, this.onClientConnected, this.onClientError, '/');
    }

    subscribe(endpoint, subscriber) {
        let subNeeded = false;
        if (this.Subscriptions[endpoint]) {
            if (!this.Subscriptions[endpoint].subscription) {
                subNeeded = true;
            }

            if (this.Subscriptions[endpoint].subscribers.filter(obj => obj === subscriber).length === 0) {
                this.Subscriptions[endpoint].subscribers.push(subscriber);
            }
        }
        else {
            this.Subscriptions[endpoint] = { subscription: null, subscribers: [subscriber] };
            subNeeded = true;
        }

        if (this.isConnected && subNeeded) {
            this.Subscriptions[endpoint].subscription = this.Connection.subscribe(endpoint, this.messageHandler);
        }
    }

    unsubscribe(endpoint, subscriber) {
        let unsubNeeded = false;

        if (this.Subscriptions[endpoint] && this.Subscriptions[endpoint].subscribers.length > 0) {
            this.Subscriptions[endpoint].subscribers = this.Subscriptions[endpoint].subscribers.filter(obj => obj !== subscriber);
            if (this.Subscriptions[endpoint].subscribers.length === 0 && this.Subscriptions[endpoint].subscription) {
                unsubNeeded = true;
            }
        }

        if (this.isConnected && unsubNeeded) {
            this.Subscriptions[endpoint].subscription.unsubscribe();
            this.Subscriptions[endpoint].subscription = null;
        }
    }
}

export default SockJsConnection;
