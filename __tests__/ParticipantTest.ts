import * as chai from "chai";
import {AnonymousParticipant, UserParticipant, SystemParticipant} from "../Participant";


const assert = chai.assert;


describe('Participant', () => {

    it('Anonymous', () => {
        const participant = new AnonymousParticipant();

        assert.strictEqual(participant.type, AnonymousParticipant.TYPE);
    });

    it('User', () => {
        const user = {some: 'user', data: ':)'};
        const participant = new UserParticipant(user);

        assert.strictEqual(participant.type, UserParticipant.TYPE);
        assert.strictEqual(participant.user, user);
    });

    it('System', () => {
        const participant = new SystemParticipant;

        assert.strictEqual(participant.type, SystemParticipant.TYPE);
    })
});
