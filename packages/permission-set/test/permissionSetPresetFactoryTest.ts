import {createFactory} from "@pallad/entity-ref";
import {permissionSetPresetFactory} from "@src/permissionSetPresetFactory";
import {IsExact, assert} from "conditional-type-checks";
import {PermissionSet} from "@src/PermissionSet";
import {ORGANIZATION_REF, organizationFactory, PRODUCT_REF, productFactory} from "./fixtures";
import {Subject} from "@pallad/access-control";

describe('permissionSetPresetFactory', () => {
    const FOO_BAR = {foo: 'bar'} as const;
    const factory = permissionSetPresetFactory('product', {
        canUpdate: ['update', productFactory] as const,
        canDelete: ['delete', productFactory] as const,
        canCreate: ['create', organizationFactory] as const,
        canTruncate: ['truncate', Subject.Global] as const,
        canActivate: ['activate', (value: unknown): value is typeof FOO_BAR => {
            return value === FOO_BAR;
        }] as const
    });

    it('provided methods are assigned to final object and those methods return access control query params with action and subject', () => {
        expect(factory.canDelete(PRODUCT_REF))
            .toMatchSnapshot();

        expect(factory.canCreate(ORGANIZATION_REF))
            .toMatchSnapshot();

        expect(factory.canUpdate(PRODUCT_REF))
            .toMatchSnapshot();
    });

    it('types', () => {
        type ProductEntityRef = ReturnType<typeof productFactory>;
        type OrganizationEntityRef = ReturnType<typeof organizationFactory>;

        type Factory = typeof factory;

        assert<IsExact<Parameters<Factory['canCreate']>[0], OrganizationEntityRef>>(true);
        assert<IsExact<Parameters<Factory['canDelete']>[0], ProductEntityRef>>(true);
        assert<IsExact<Parameters<Factory['canUpdate']>[0], ProductEntityRef>>(true);

        assert<IsExact<Factory['permissionSet'], PermissionSet<
            ['update', ProductEntityRef] | ['delete', ProductEntityRef] | ['create', OrganizationEntityRef] | ['truncate', Subject.Global] | ['activate', typeof FOO_BAR]
        >>>(true);
    });

    it('returned permission set is preconfigured with all methods', () => {
        expect(factory.permissionSet.canHandleQuery({
            ...factory.canUpdate(PRODUCT_REF),
            principal: {}
        })).toBe(true);

        expect(factory.permissionSet.canHandleQuery({
            ...factory.canDelete(PRODUCT_REF),
            principal: {}
        })).toBe(true);

        expect(factory.permissionSet.canHandleQuery({
            ...factory.canCreate(ORGANIZATION_REF),
            principal: {}
        })).toBe(true);

        expect(factory.permissionSet.canHandleQuery({
            ...factory.canTruncate(Subject.Global.INSTANCE),
            principal: {}
        })).toBe(true);

        expect(factory.permissionSet.canHandleQuery({
            ...factory.canActivate(FOO_BAR),
            principal: {}
        })).toBe(true);
    });
});
