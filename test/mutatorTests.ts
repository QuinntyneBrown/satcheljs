import 'jasmine';
import mutator from '../src/mutator';
import * as dispatcher from '../src/dispatcher';
import * as globalContext from '../src/globalContext';
import * as mobx from 'mobx';

describe('mutator', () => {
    let mockGlobalContext: any;

    beforeEach(() => {
        mockGlobalContext = { currentMutator: null };
        spyOn(globalContext, 'getGlobalContext').and.returnValue(mockGlobalContext);
        spyOn(dispatcher, 'subscribe');
    });

    it('throws if the action creator does not have an action ID', () => {
        // Arrange
        let actionCreator: any = {};

        // Act / Assert
        expect(() => {
            mutator(actionCreator, () => {});
        }).toThrow();
    });

    it('subscribes the target function to the action', () => {
        // Arrange
        let actionId = 'testAction';
        let actionCreator: any = { __SATCHELJS_ACTION_ID: actionId };

        // Act
        mutator(actionCreator, () => {});

        // Assert
        expect(dispatcher.subscribe).toHaveBeenCalled();
        expect((<jasmine.Spy>dispatcher.subscribe).calls.argsFor(0)[0]).toBe(actionId);
    });

    it('wraps the subscribed callback in a MobX action', () => {
        // Arrange
        let callback = () => {};
        let wrappedCallback = () => {};
        let actionCreator: any = { __SATCHELJS_ACTION_ID: 'testAction' };
        spyOn(mobx, 'action').and.returnValue(wrappedCallback);

        // Act
        mutator(actionCreator, callback);

        // Assert
        expect(mobx.action).toHaveBeenCalled();
    });

    it('returns the target function', () => {
        // Arrange
        let actionCreator: any = { __SATCHELJS_ACTION_ID: 'testAction' };
        let callback = () => {};

        // Act
        let returnValue = mutator(actionCreator, callback);

        // Assert
        expect(returnValue).toBe(callback);
    });

    it('sets the currentMutator to actionMessage type for the duration of the mutator callback', () => {
        // Arrange
        let actionCreator: any = {
            __SATCHELJS_ACTION_ID: 'testAction',
            __SATCHELJS_ACTION_TYPE: 'testActionType',
        };
        let callback = () => {
            expect(mockGlobalContext.currentMutator).toBe('testActionType');
        };
        mutator(actionCreator, callback);

        // Act
        let subscribedCallback = (dispatcher.subscribe as jasmine.Spy).calls.argsFor(0)[1];
        subscribedCallback();

        // Assert
        expect(mockGlobalContext.currentMutator).toBe(null);
    });

    it('sets the currentMutator back to null if error is thrown', () => {
        // Arrange
        let actionCreator: any = {
            __SATCHELJS_ACTION_ID: 'testAction',
            __SATCHELJS_ACTION_TYPE: 'testActionType',
        };
        let callback: any = () => {
            throw new Error('Error in Mutator');
        };
        mutator(actionCreator, callback);

        // Act
        let subscribedCallback = (dispatcher.subscribe as jasmine.Spy).calls.argsFor(0)[1];
        try {
            subscribedCallback();
        } catch {
            // no op
        }

        // Assert
        expect(mockGlobalContext.currentMutator).toBe(null);
    });
});
