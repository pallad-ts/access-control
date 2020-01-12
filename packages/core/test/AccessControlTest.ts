import {Rule} from "@src/Rule";
import {Participant} from "@src/Participant";
import {AccessControl} from "@src/AccessControl";
import * as sinon from 'sinon';

class DummyRule implements Rule {

    constructor(private supportedPrivileges: any[], private allowed: boolean) {

    }

    supports(privilege: any, subject: any): boolean {
        return this.supportedPrivileges.indexOf(privilege) !== -1;
    }

    isAllowed(participant: any, privilege: any, subject: any): Promise<boolean> | boolean {
        return this.allowed;
    }
}

describe('AccessControl', () => {
    const PRIV_1 = 'priv-1';
    const PRIV_2 = 'priv-2';

    const PARTICIPANT = new Participant.Anonymous();
    const SUBJECT = {some: 'subject'};

    let ac: AccessControl;
    beforeEach(() => {
        ac = new AccessControl();
    });

    describe('asserting access', () => {
        it('success', () => {
            const rule = new DummyRule([PRIV_1], true);
            ac.registerRule(rule);

            return expect(ac.assertAccess(PARTICIPANT, PRIV_1, SUBJECT))
                .resolves
                .toBeTruthy();
        });

        describe('failure', () => {
            it('simple', () => {
                return expect(ac.assertAccess(PARTICIPANT, PRIV_1, SUBJECT))
                    .rejects
                    .toThrowError('Access denied');
            });

            it('with custom message', () => {
                const message = 'Custom message';
                return expect(ac.assertAccess(PARTICIPANT, PRIV_1, SUBJECT, message))
                    .rejects
                    .toThrowError(message);
            });
        });
    });

    it('uses first rule that supports privilege and subject', async () => {
        const rule = new DummyRule([PRIV_1], true);
        const unusedRule = sinon.stub(new DummyRule([PRIV_1], false));

        ac.registerRule(rule);
        ac.registerRule(unusedRule);

        expect(await ac.isAllowed(PARTICIPANT, PRIV_1, SUBJECT))
            .toBeTruthy();

        sinon.assert.notCalled(unusedRule.supports);
    });

    it('returns false if none of the rules supports privilege', () => {
        ac.registerRule(new DummyRule([PRIV_1], true));
        ac.registerRule(new DummyRule([], true));

        return expect(ac.isAllowed(PARTICIPANT, PRIV_2, SUBJECT))
            .resolves
            .toBeFalsy();
    });

    it('returns false if first rule that supports privileges and subject denies access', () => {
        ac.registerRule(new DummyRule([PRIV_2], true));
        ac.registerRule(new DummyRule([PRIV_1], false));

        return expect(ac.isAllowed(PARTICIPANT, PRIV_1, SUBJECT))
            .resolves
            .toBeFalsy();
    });

    it('unregister rule', () => {
        const rule = new DummyRule([PRIV_1], true);

        ac.registerRule(rule);
        ac.unregisterRule(rule);

        return expect(ac.isAllowed(PARTICIPANT, PRIV_1, SUBJECT))
            .resolves
            .toBeFalsy();
    });
});