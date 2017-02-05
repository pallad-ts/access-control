import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import {RuleInterface} from "../Rule";
import {Participant, AnonymousParticipant} from "../Participant";
import {ACL} from "../ACL";
import * as sinonModule from 'sinon';

chai.use(chaiAsPromised);

const assert = chai.assert;

class DummyRule implements RuleInterface {

    constructor(private supportedPrivileges: Array<any>, private allowed: boolean) {

    }

    supports(privilege: any, subject: any): boolean {
        return this.supportedPrivileges.indexOf(privilege) !== -1;
    }

    isAllowed(participant: Participant, privilege: any, subject: any): Promise<boolean>|boolean {
        return this.allowed;
    }
}

describe('ACL', () => {
    const PRIV_1 = 'priv-1';
    const PRIV_2 = 'priv-2';

    const participant = new AnonymousParticipant;
    const subject = {some: 'subject'};

    let acl;
    let sinon;
    beforeEach(() => {
        sinon = sinonModule.sandbox.create();
        acl = new ACL();
    });

    afterEach(() => {
        sinon.verify();
    });

    it('uses first rule that supports privilege and subject', () => {
        const rule = new DummyRule([PRIV_1], true);
        const unusedRule = new DummyRule([PRIV_1], false);

        const mock = sinon.mock(unusedRule);

        mock.expects('supports')
            .never();

        acl.registerRule(rule);
        acl.registerRule(unusedRule);

        return assert.eventually.isTrue(acl.isAllowed(participant, PRIV_1, subject));
    });

    it('returns false if none of the rules supports privilege', () => {
        acl.registerRule(new DummyRule([PRIV_1], true));
        acl.registerRule(new DummyRule([], true));

        return assert.eventually.isFalse(acl.isAllowed(participant, PRIV_2, subject));
    });

    it('returns false if first rule that supports privileges and subject denies access', () => {
        acl.registerRule(new DummyRule([PRIV_2], true));
        acl.registerRule(new DummyRule([PRIV_1], false));

        return assert.eventually.isFalse(acl.isAllowed(participant, PRIV_1, subject));
    });

    it('supports returning result via callback', (done) => {
        acl.registerRule(new DummyRule([PRIV_1], true));
        acl.isAllowed(participant, PRIV_1, subject, (err, result) => {
            try {
                assert.isTrue(result);
                done();
            }
            catch (e) {
                done(e);
            }
        });
    });

    it('unregister rule', () => {
        const rule = new DummyRule([PRIV_1], true);

        acl.registerRule(rule);
        acl.unregisterRule(rule);

        return assert.eventually.isFalse(acl.isAllowed(participant, PRIV_1, subject));
    });
});