const onSockJsMessage = (payload) => {
    return {
        type: 'SOCKJS_ONMESSAGE',
        ...payload
    }
};

const sockJsSubscribe = (endpoint, subscriber) => {
    return {
        type: 'SOCKJS_SUBSCRIBE',
        ...payload
    }
};

const sockJsUnsubscribe = (endpoint, subscriber) => {
    return {
        type: 'SOCKJS_UNSUBSCRIBE',
        endpoint,
        subscriber
    }
};

export default {
    onSockJsMessage,
    sockJsSubscribe,
    sockJsUnsubscribe
};