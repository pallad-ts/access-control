import {AccessControl, AccessDeniedError} from "alpha-ac";
import * as sinon from 'sinon';

export function accessControlStub(): AccessControlStub {
    const ac: AccessControlStub = sinon.createStubInstance(AccessControl) as any as AccessControlStub;

    ac.allowOn = (participant, permission, subject) => {
        ac.isAllowed
            .withArgs(participant, permission, subject)
            .resolves(true);

        ac.assertAccess
            .withArgs(participant, permission, subject)
            .resolves(undefined);
    };

    ac.denyOn = (participant, permission, subject) => {
        ac.isAllowed
            .withArgs(participant, permission, subject)
            .resolves(false);

        ac.assertAccess
            .withArgs(participant, permission, subject)
            .rejects(new AccessDeniedError('Access denied'))
    };

    ac.isAllowed
        .resolves(false);

    ac.assertAccess
        .rejects(new AccessDeniedError('Access denied'));

    return ac;
}

export type AccessControlStub = sinon.SinonStubbedInstance<AccessControl> & {
    allowOn(participant: any, permission: string, subject: any): void;
    denyOn(participant: any, permission: string, subject: any): void;
}