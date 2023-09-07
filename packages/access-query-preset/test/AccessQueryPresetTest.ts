import {AccessQueryPreset} from "@src/AccessQueryPreset";
import {ACTION_CREATE, ACTION_UPDATE, ORGANIZATION_REF, organizationFactory, OrganizationRef, PRODUCT_REF, productFactory, ProductRef} from "./fixtures";
import * as sinon from 'sinon';
import {assert, IsExact} from "conditional-type-checks";
import {AccessQuery, Policy, Subject} from "@pallad/access-control";
import {createFactory} from "@pallad/entity-ref";

describe('AccessQueryPreset', () => {
	const accessQueryPreset = new AccessQueryPreset<
		[typeof ACTION_CREATE, OrganizationRef] | [typeof ACTION_UPDATE, ProductRef]
	>('product');
	accessQueryPreset.addEntry(ACTION_CREATE, organizationFactory);
	accessQueryPreset.addEntry(ACTION_UPDATE, productFactory);

	describe('canHandleQuery', () => {
		it('returns false if combination of action and subject is not defined in permission set', () => {
			expect(accessQueryPreset.canHandleQuery(
				{
					action: ACTION_UPDATE,
					subject: accessQueryPreset.wrapSubjectWithSubjectType(ORGANIZATION_REF),
					principal: {}
				}
			))
				.toBe(false);
		});

		it('returns true if combination of action and subject is defined in permission set', () => {
			expect(accessQueryPreset.canHandleQuery(
				{
					action: ACTION_UPDATE,
					subject: accessQueryPreset.wrapSubjectWithSubjectType(PRODUCT_REF),
					principal: {}
				}
			))
				.toBe(true);

			expect(accessQueryPreset.canHandleQuery(
				{
					action: ACTION_CREATE,
					subject: accessQueryPreset.wrapSubjectWithSubjectType(ORGANIZATION_REF),
					principal: {}
				}
			))
				.toBe(true);
		});

		it('returns false for subject from different permission set origin', () => {
			const articlePermissionSet = new AccessQueryPreset('article');
			articlePermissionSet.addEntry(ACTION_CREATE, organizationFactory);

			expect(accessQueryPreset.canHandleQuery(
				{
					action: ACTION_CREATE,
					subject: articlePermissionSet.wrapSubjectWithSubjectType(ORGANIZATION_REF),
					principal: {}
				}
			))
				.toBe(false);
		});
	});

	describe('defining subject', () => {
		it('as entity ref factory', () => {
			const factory = createFactory('some-entity-ref', (id: string) => ({id}));
			accessQueryPreset.addEntry(ACTION_CREATE, factory);

			expect(accessQueryPreset.canHandleQuery({
				action: ACTION_CREATE,
				subject: accessQueryPreset.wrapSubjectWithSubjectType(factory('1')),
				principal: {}
			}))
				.toBe(true);

			expect(accessQueryPreset.canHandleQuery({
				action: ACTION_CREATE,
				subject: accessQueryPreset.wrapSubjectWithSubjectType({}),
				principal: {}
			}))
				.toBe(false);
		});

		it('as constructor', () => {
			accessQueryPreset.addEntry(ACTION_CREATE, Subject.Global);

			expect(accessQueryPreset.canHandleQuery({
				action: ACTION_CREATE,
				subject: accessQueryPreset.wrapSubjectWithSubjectType(Subject.Global.INSTANCE),
				principal: {}
			}))
				.toBe(true);

			expect(accessQueryPreset.canHandleQuery({
				action: ACTION_CREATE,
				subject: accessQueryPreset.wrapSubjectWithSubjectType({}),
				principal: {}
			}))
				.toBe(false);
		});

		it('as type guard', () => {
			const subject = {foo: 'bar'} as const;
			accessQueryPreset.addEntry(ACTION_CREATE, (value: unknown): value is { foo: 'bar' } => {
				return value === subject;
			});

			expect(accessQueryPreset.canHandleQuery({
				action: ACTION_CREATE,
				subject: accessQueryPreset.wrapSubjectWithSubjectType(subject),
				principal: {}
			}))
				.toBe(true);

			expect(accessQueryPreset.canHandleQuery({
				action: ACTION_CREATE,
				subject: accessQueryPreset.wrapSubjectWithSubjectType({}),
				principal: {}
			}))
				.toBe(false);
		});

		it('invalid subject definition', () => {
			expect(() => {
				accessQueryPreset.addEntry(ACTION_CREATE, {} as any);
			}).toThrowErrorMatchingSnapshot();
		})
	});

	describe('createPolicy', () => {
		it('policy function is called only for access query shape defined in permission set', () => {
			const policyFunction = sinon.stub().returns(true);

			const policy = accessQueryPreset.createPolicy(policyFunction);

			const invalidAccessQuery = {
				principal: {},
				subject: accessQueryPreset.wrapSubjectWithSubjectType(PRODUCT_REF),
				action: ACTION_CREATE
			};
			expect(policy(invalidAccessQuery as any))
				.toBeUndefined();
			sinon.assert.notCalled(policyFunction);

			const validAccessQuery = {
				principal: {},
				subject: accessQueryPreset.wrapSubjectWithSubjectType(ORGANIZATION_REF),
				action: ACTION_CREATE
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
			type AccessQueryPresetType = typeof accessQueryPreset;
			const p = accessQueryPreset.createPolicy({} as any);

			assert<IsExact<
				ReturnType<AccessQueryPresetType['createPolicy']>,
				Policy<
					AccessQuery<unknown, typeof ACTION_CREATE, AccessQueryPreset.Subject<OrganizationRef>> |
					AccessQuery<unknown, typeof ACTION_UPDATE, AccessQueryPreset.Subject<ProductRef>>
				>
			>>(true);
		});
	});
});
