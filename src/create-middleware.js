import SockJsConnection from './sockjs-connection';
import {Observable} from 'rxjs/Observable';
import {bufferTime} from 'rxjs/add/operator/bufferTime';
import {onSockJsMessage} from './actions';

let PipelineSubscription = null;
let Connection = null;
let Pipeline = null;
let dispatch = null;

const CreateMiddleware = (baseUri, username, password, batchInterval) => {
    Pipeline = Observable.create(observer => {
        const handleMessage = (payload) => {
            observer.next({ endpoint: payload.headers.destination, body: JSON.parse(payload.body) });
        };

        Connection = new SockJsConnection(baseUri, username, password, handleMessage);
    }).bufferTime(batchInterval);

    PipelineSubscription = Pipeline.subscribe(
    function (x) { 
        if(x.length > 0) {
            x.forEach(function(element) {
                dispatch(onSockJsMessage(element));
            }, this);
        }
    },
    function (err) { console.log('SockJS Error: ' + err); },
    function () { console.log('SockJS Completed'); });
    

    const middleware = store => next => action => {
        if (action.type === 'SOCKJS_SUBSCRIBE' && action.endpoint && action.subscriber) {
            Connection.subscribe(action.endpoint, action.subscriber);
            dispatch = store.dispatch;
        }
        else if (action.type === 'SOCKJS_UNSUBSCRIBE' && action.endpoint && action.subscriber) {
            Connection.unsubscribe(action.endpoint, action.subscriber);
        }

        return next(action);
    };

    return middleware;
};

export default CreateMiddleware;
