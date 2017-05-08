import SockJS from 'sockjs-client';
import Stomp from 'stompjs/lib/stomp.min';

const CreateConnection = (url) => {

};

class Connection {

    constructor() {
        this.connections = {};

        this.addConnection = this.addConnection.bind(this);
    }

    

    addConnection(url) {
        const ws = new SockJS(url);
        let client = Stomp.over(ws);
    }
}
