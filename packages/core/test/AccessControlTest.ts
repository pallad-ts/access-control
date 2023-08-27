import {Policy} from "@src/Policy";
import {AccessControl} from "@src/AccessControl";
import * as sinon from 'sinon';
import {AccessQuery} from "@src/AccessQuery";


function dummyPolicy(supportedActions: any[], isGranted: boolean | undefined, asyncDelay?: number): Policy {
    return ({action}) => {
        if (supportedActions.includes(action)) {
            if (asyncDelay) {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(isGranted)
                    }, asyncDelay);
                })
            }
            return isGranted;
        }
    };
}

describe('AccessControl', () => {
    const ACTION_1 = 'priv-1';
    const ACTION_2 = 'priv-2';
    const ACTION_3 = 'priv-3';

    const PRINCIPAL = {some: 'principal'};
    const SUBJECT = {some: 'subject'};

    let accessControl: AccessControl;
    const STANDARD_REQUEST: AccessQuery = {
        principal: PRINCIPAL,
        subject: SUBJECT,
        action: ACTION_1
    };

    beforeEach(() => {
        accessControl = new AccessControl();
    });

    describe('asserting access', () => {
        it('success', () => {
            const policy = dummyPolicy([ACTION_1], true);
            accessControl.registerPolicy(policy);

            return expect(accessControl.assertGranted(STANDARD_REQUEST))
                .resolves
                .toBeTruthy();
        });

        describe('failure', () => {
            it('simple', () => {
                return expect(accessControl.assertGranted(STANDARD_REQUEST))
                    .rejects
                    .toThrowError('Access denied');
            });

            it('with custom error factory', async () => {
                const error = new Error('Custom error');
                const factory = sinon.stub().returns(error);

                await expect(accessControl.assertGranted(STANDARD_REQUEST, factory))
                    .rejects
                    .toThrowError(error);
                sinon.assert.calledWith(factory, {principal: PRINCIPAL, action: ACTION_1, subject: SUBJECT});
            });
        });
    });

    describe('isGranted', () => {
        it('access is revoked if there is no policy that is able to handle request', () => {
            return expect(accessControl.isGranted(STANDARD_REQUEST))
                .resolves
                .toBe(false);
        });

        it('access is granted if there is a policy that grants access (sync) and other policies abstain from decision', async () => {
            const abstainPolicy1 = sinon.spy(dummyPolicy([ACTION_2], true));
            const abstainPolicy2 = sinon.spy(dummyPolicy([ACTION_3], true));
            accessControl
                .registerPolicy(abstainPolicy1)
                .registerPolicy(dummyPolicy([ACTION_1], true))
                .registerPolicy(abstainPolicy2);

            await expect(accessControl.isGranted(STANDARD_REQUEST))
                .resolves
                .toBe(true);

            sinon.assert.calledOnce(abstainPolicy1);
            sinon.assert.calledOnce(abstainPolicy2);
        });

        it('access is revoked as soon as one of policies revokes access (sync)', async () => {
            const abstainPolicy1 = sinon.spy(dummyPolicy([ACTION_2], true));
            const revokePolicy = dummyPolicy([ACTION_1], false);
            const abstainPolicy2 = sinon.spy(dummyPolicy([ACTION_2], true));

            accessControl
                .registerPolicy(abstainPolicy1)
                .registerPolicy(revokePolicy)
                .registerPolicy(abstainPolicy2);

            await expect(accessControl.isGranted(STANDARD_REQUEST))
                .resolves
                .toBe(false);

            sinon.assert.calledOnce(abstainPolicy1);
            sinon.assert.calledOnce(abstainPolicy2);
        });

        it('access is revoked as soon as one of policies revokes access (async)', async () => {
            const abstainPolicy1 = sinon.spy(dummyPolicy([ACTION_2], true));
            const abstainPolicy2 = sinon.spy(dummyPolicy([ACTION_2], true));

            accessControl
                .registerPolicy(
                    dummyPolicy([ACTION_1], false, 100)
                )
                .registerPolicy(abstainPolicy1)
                .registerPolicy(abstainPolicy2)

            await expect(accessControl.isGranted(STANDARD_REQUEST))
                .resolves
                .toBe(false);

            sinon.assert.calledOnce(abstainPolicy1);
            sinon.assert.calledOnce(abstainPolicy2);
        });

        it('access is revoked as soon as one of policies revokes access (async) but other promise based policies might still be called', async () => {
            const abstainPolicy1 = sinon.spy(dummyPolicy([ACTION_2], true));
            const abstainPolicy2 = sinon.spy(dummyPolicy([ACTION_2], true));
            const grantPolicy = sinon.spy(dummyPolicy([ACTION_1], true, 50));

            accessControl
                .registerPolicy(
                    dummyPolicy([ACTION_1], false, 100)
                )
                .registerPolicy(abstainPolicy1)
                .registerPolicy(abstainPolicy2)
                .registerPolicy(grantPolicy);

            await expect(accessControl.isGranted(STANDARD_REQUEST))
                .resolves
                .toBe(false);

            sinon.assert.calledOnce(abstainPolicy1);
            sinon.assert.calledOnce(abstainPolicy2);
            sinon.assert.calledOnce(grantPolicy);
        });

        it('access is granted if one of policies grants access (async)', async () => {
            const abstainPolicy1 = sinon.spy(dummyPolicy([ACTION_2], true));
            const abstainPolicy2 = sinon.spy(dummyPolicy([ACTION_2], true));

            accessControl
                .registerPolicy(
                    dummyPolicy([ACTION_1], true, 100)
                )
                .registerPolicy(abstainPolicy1)
                .registerPolicy(abstainPolicy2)

            await expect(accessControl.isGranted(STANDARD_REQUEST))
                .resolves
                .toBe(true);

            sinon.assert.calledOnce(abstainPolicy1);
            sinon.assert.calledOnce(abstainPolicy2);
        });

        it('access is revoked is all policies abstain from voting (sync and async)', async () => {
            const abstainPolicy1 = sinon.spy(dummyPolicy([ACTION_2], true));
            const abstainPolicy2 = sinon.spy(dummyPolicy([ACTION_1], undefined, 100));
            const abstainPolicy3 = sinon.spy(dummyPolicy([ACTION_2], true));

            accessControl
                .registerPolicy(abstainPolicy1)
                .registerPolicy(abstainPolicy2)
                .registerPolicy(abstainPolicy3)

            await expect(accessControl.isGranted(STANDARD_REQUEST))
                .resolves
                .toBe(false);

            sinon.assert.calledOnce(abstainPolicy1);
            sinon.assert.calledOnce(abstainPolicy2);
            sinon.assert.calledOnce(abstainPolicy3);
        });

        describe('rejects once one of policies throws an error', () => {

            it('sync policy', () => {
                const error = new Error('Custom error');
                const policy = sinon.stub().throws(error);
                accessControl
                    .registerPolicy(policy);

                return expect(accessControl.isGranted(STANDARD_REQUEST))
                    .rejects
                    .toBe(error);
            });

            it('async policy', () => {
                const error = new Error('Custom error');
                const policy = sinon.stub().rejects(error);
                accessControl
                    .registerPolicy(policy);

                return expect(accessControl.isGranted(STANDARD_REQUEST))
                    .rejects
                    .toBe(error);
            });
        })
    });

    it('deregister policy', () => {
        const policy = dummyPolicy([ACTION_1], true);
        accessControl.registerPolicy(policy);
        accessControl.deregisterRule(policy);

        return expect(accessControl.isGranted(STANDARD_REQUEST))
            .resolves
            .toBeFalsy();
    });
});
