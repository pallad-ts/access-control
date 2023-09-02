import {PermissionSet} from "@src/PermissionSet";
import {ACTION_CREATE, ACTION_UPDATE, ORGANIZATION_REF, organizationFactory, OrganizationRef, PRODUCT_REF, productFactory, ProductRef} from "./fixtures";
import * as sinon from 'sinon';
import {assert, IsExact} from "conditional-type-checks";
import {AccessQuery, Policy, Subject} from "@pallad/access-control";
import {createFactory} from "@pallad/entity-ref";

describe('PermissionSet', () => {
    const permissionSet = new PermissionSet<
        [typeof ACTION_CREATE, OrganizationRef] | [typeof ACTION_UPDATE, ProductRef]
    >('product');
    permissionSet.addEntry(ACTION_CREATE, organizationFactory);
    permissionSet.addEntry(ACTION_UPDATE, productFactory);

    describe('canHandleQuery', () => {
        it('returns false if combination of action and subject is not defined in permission set', () => {
            expect(permissionSet.canHandleQuery(
                {
                    action: ACTION_UPDATE,
                    subject: permissionSet.wrapSubjectWithSubjectType(ORGANIZATION_REF),
                    principal: {}
                }
            ))
                .toBe(false);
        });

        it('returns true if combination of action and subject is defined in permission set', () => {
            expect(permissionSet.canHandleQuery(
                {
                    action: ACTION_UPDATE,
                    subject: permissionSet.wrapSubjectWithSubjectType(PRODUCT_REF),
                    principal: {}
                }
            ))
                .toBe(true);

            expect(permissionSet.canHandleQuery(
                {
                    action: ACTION_CREATE,
                    subject: permissionSet.wrapSubjectWithSubjectType(ORGANIZATION_REF),
                    principal: {}
                }
            ))
                .toBe(true);
        });

        it('returns false for subject from different permission set origin', () => {
            const articlePermissionSet = new PermissionSet('article');
            articlePermissionSet.addEntry(ACTION_CREATE, organizationFactory);

            expect(permissionSet.canHandleQuery(
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
            permissionSet.addEntry(ACTION_CREATE, factory);

            expect(permissionSet.canHandleQuery({
                action: ACTION_CREATE,
                subject: permissionSet.wrapSubjectWithSubjectType(factory('1')),
                principal: {}
            }))
                .toBe(true);

            expect(permissionSet.canHandleQuery({
                action: ACTION_CREATE,
                subject: permissionSet.wrapSubjectWithSubjectType({}),
                principal: {}
            }))
                .toBe(false);
        });

        it('as constructor', () => {
            permissionSet.addEntry(ACTION_CREATE, Subject.Global);

            expect(permissionSet.canHandleQuery({
                action: ACTION_CREATE,
                subject: permissionSet.wrapSubjectWithSubjectType(Subject.Global.INSTANCE),
                principal: {}
            }))
                .toBe(true);

            expect(permissionSet.canHandleQuery({
                action: ACTION_CREATE,
                subject: permissionSet.wrapSubjectWithSubjectType({}),
                principal: {}
            }))
                .toBe(false);
        });

        it('as type guard', () => {
            const subject = {foo: 'bar'} as const;
            permissionSet.addEntry(ACTION_CREATE, (value: unknown): value is { foo: 'bar' } => {
                return value === subject;
            });

            expect(permissionSet.canHandleQuery({
                action: ACTION_CREATE,
                subject: permissionSet.wrapSubjectWithSubjectType(subject),
                principal: {}
            }))
                .toBe(true);

            expect(permissionSet.canHandleQuery({
                action: ACTION_CREATE,
                subject: permissionSet.wrapSubjectWithSubjectType({}),
                principal: {}
            }))
                .toBe(false);
        });

        it('invalid subject definition', () => {
            expect(() => {
                permissionSet.addEntry(ACTION_CREATE, {} as any);
            }).toThrowErrorMatchingSnapshot();
        })
    });

    describe('createPolicy', () => {
        it('policy function is called only for access query shape defined in permission set', () => {
            const policyFunction = sinon.stub().returns(true);

            const policy = permissionSet.createPolicy(policyFunction);

            const invalidAccessQuery = {
                principal: {},
                subject: permissionSet.wrapSubjectWithSubjectType(PRODUCT_REF),
                action: ACTION_CREATE
            };
            expect(policy(invalidAccessQuery as any))
                .toBeUndefined();
            sinon.assert.notCalled(policyFunction);

            const validAccessQuery = {
                principal: {},
                subject: permissionSet.wrapSubjectWithSubjectType(ORGANIZATION_REF),
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
            type PermissionSetType = typeof permissionSet;
            const p = permissionSet.createPolicy({} as any);

            assert<IsExact<
                ReturnType<PermissionSetType['createPolicy']>,
                Policy<
                    AccessQuery<unknown, typeof ACTION_CREATE, PermissionSet.Subject<OrganizationRef>> |
                    AccessQuery<unknown, typeof ACTION_UPDATE, PermissionSet.Subject<ProductRef>>
                >
            >>(true);
        });
    });
});
