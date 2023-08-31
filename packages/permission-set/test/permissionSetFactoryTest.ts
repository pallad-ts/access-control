import {createFactory} from "@pallad/entity-ref";
import {permissionSetFactory} from "@src/permissionSetFactory";
import {IsExact, assert} from "conditional-type-checks";
import {PermissionSet} from "@src/PermissionSet";
import {ORGANIZATION_REF, organizationFactory, PRODUCT_REF, productFactory} from "./fixtures";

describe('permissionSetFactory', () => {
	const factory = permissionSetFactory('product', {
		canUpdate: ['update', productFactory] as const,
		canDelete: ['delete', productFactory] as const,
		canCreate: ['create', organizationFactory] as const
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
			['update', ProductEntityRef] | ['delete', ProductEntityRef] | ['create', OrganizationEntityRef]
		>>>(true);
	});
});
