import ActionCreator from './interfaces/ActionCreator';
import ActionMessage from './interfaces/ActionMessage';
import Subscriber from './interfaces/Subscriber';
import { subscribe } from './dispatcher';

export default function mutator<T extends ActionMessage>(
    actionCreator: ActionCreator<T>,
    callback: Subscriber<T>)
{
    subscribe(actionCreator, callback);
}
