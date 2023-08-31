import {AccessControl} from "@pallad/access-control";
import {stubAccessControl} from "@src/stubAccessControl";
import {ACTION, PRINCIPAL, PRINCIPAL_2, SUBJECT} from "./fixtures";
import * as sinon from 'sinon';

describe('stubAccessControl', () => {
	it('stubbed access control overrides original `isAllowed` method', async () => {
		const accessControl = new AccessControl();

		const spy = sinon.spy(accessControl.isAllowed);
		const stubbed = stubAccessControl(accessControl);

		await expect(stubbed.isAllowed({
			principal: PRINCIPAL,
			subject: SUBJECT,
			action: ACTION
		}))
			.resolves
			.toBe(false);

		sinon.assert.notCalled(spy);
	});

	describe('allowFor', () => {
		let stubbedAccessControl: stubAccessControl.Stubbed<AccessControl>;
		beforeEach(() => {
			stubbedAccessControl = stubAccessControl(new AccessControl());
		});

		it('calling allowFor with `anyAccessQuery` effectively allows everything', () => {
			stubbedAccessControl.allowFor()
				.anyAccessQuery();

			return expect(stubbedAccessControl.isAllowed({
				principal: Math.random(),
				subject: Math.random(),
				action: String(Math.random())
			}))
				.resolves
				.toBe(true);
		});

		it('allows only access queries that match stub matcher', async () => {
			stubbedAccessControl.allowFor()
				.anySubject()
				.anyAction()
				.principal(PRINCIPAL);

			await expect(stubbedAccessControl.isAllowed({
				subject: Math.random(),
				action: String(Math.random()),
				principal: PRINCIPAL
			}))
				.resolves
				.toBe(true);

			await expect(stubbedAccessControl.isAllowed({
				subject: Math.random(),
				action: String(Math.random()),
				principal: PRINCIPAL_2
			}))
				.resolves
				.toBe(false);
		});
	});
});
