import {Participant} from "@src/Participant";

describe('Participant', () => {

    describe('Anonymous', () => {
        it('checking type', () => {
            expect(Participant.Anonymous.is(new Participant.Anonymous()))
                .toBeTruthy();

            expect(Participant.Anonymous.is({}))
                .toBeFalsy();
        });
    });

    describe('Account', () => {
        const ACCOUNT = {some: 'user', data: '1'};

        it('checking type', () => {
            expect(Participant.Account.is(new Participant.Account(ACCOUNT)))
                .toBeTruthy();
            expect(Participant.Account.is({}))
                .toBeFalsy();
        });
    });

    describe('System', () => {
        it('checking type', () => {
            expect(Participant.System.is(new Participant.System()))
                .toBeTruthy();
            expect(Participant.System.is({}))
                .toBeFalsy();
        })
    });
});