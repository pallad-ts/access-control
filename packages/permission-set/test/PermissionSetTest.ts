import {permissionSetFactory} from "@src/permissionSetFactory";
import {PermissionSet} from "@src/PermissionSet";
import {ORGANIZATION_REF, organizationFactory, OrganizationRef, PRODUCT_REF, productFactory, ProductRef} from "./fixtures";
import * as sinon from 'sinon';
import {assert, IsExact} from "conditional-type-checks";
import {AccessQuery, Policy} from "@pallad/access-control";

describe('PermissionSet', () => {
	const permissionSet = new PermissionSet<
		['create', OrganizationRef] | ['update', ProductRef]
	>('product');
	permissionSet.addEntry('create', organizationFactory);
	permissionSet.addEntry('update', productFactory);

	describe('canHandleQuery', () => {
		it('returns false if combination of action and subject is not defined in permission set', () => {
			expect(permissionSet.canHandleQuery(
				{
					action: 'update',
					subject: permissionSet.wrapEntityRefWithSubject(ORGANIZATION_REF),
					principal: {}
				}
			))
				.toBe(false);
		});

		it('returns true if combination of action and subject is defined in permission set', () => {
			expect(permissionSet.canHandleQuery(
				{
					action: 'update',
					subject: permissionSet.wrapEntityRefWithSubject(PRODUCT_REF),
					principal: {}
				}
			))
				.toBe(true);

			expect(permissionSet.canHandleQuery(
				{
					action: 'create',
					subject: permissionSet.wrapEntityRefWithSubject(ORGANIZATION_REF),
					principal: {}
				}
			))
				.toBe(true);
		});

		it('returns false for subject from different permission set origin', () => {
			const articlePermissionSet = new PermissionSet('article');
			articlePermissionSet.addEntry('create', organizationFactory);

			expect(permissionSet.canHandleQuery(
				{
					action: 'create',
					subject: articlePermissionSet.wrapEntityRefWithSubject(ORGANIZATION_REF),
					principal: {}
				}
			))
				.toBe(false);
		});
	});

	describe('createPolicy', () => {
		it('policy function is called only for access query shape defined in permission set', () => {
			const policyFunction = sinon.stub().returns(true);

			const policy = permissionSet.createPolicy(policyFunction);

			const invalidAccessQuery = {
				principal: {},
				subject: permissionSet.wrapEntityRefWithSubject(PRODUCT_REF),
				action: 'create'
			};
			expect(policy(invalidAccessQuery as any))
				.toBeUndefined();
			sinon.assert.notCalled(policyFunction);

			const validAccessQuery = {
				principal: {},
				subject: permissionSet.wrapEntityRefWithSubject(ORGANIZATION_REF),
				action: 'create'
			} as const;
			expect(policy(validAccessQuery))
				.toBe(true);
			sinon.assert.calledWith(policyFunction, {
				principal: validAccessQuery.principal,
				subject: ORGANIZATION_REF,
				action: validAccessQuery.action
			});
		});

		it('types', () => {
			type PermissionSetType = typeof permissionSet;
			const p = permissionSet.createPolicy({} as any);

			assert<IsExact<
				ReturnType<PermissionSetType['createPolicy']>,
				Policy<AccessQuery<unknown, 'create', PermissionSet.Subject<OrganizationRef>> | AccessQuery<unknown, 'update', PermissionSet.Subject<ProductRef>>>
			>>(true);
		});
	});
});
