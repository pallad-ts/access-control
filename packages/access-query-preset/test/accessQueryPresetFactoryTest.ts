import {accessQueryPresetFactory} from "@src/accessQueryPresetFactory";
import {IsExact, assert} from "conditional-type-checks";
import {AccessQueryPreset} from "@src/AccessQueryPreset";
import {ORGANIZATION_REF, organizationFactory, PRODUCT_REF, productFactory} from "./fixtures";
import {Subject} from "@pallad/access-control";
import {PRINCIPAL} from "@pallad/access-control-dev/test/fixtures";

describe('accessQueryPresetFactory', () => {
	const FOO_BAR = {foo: 'bar'} as const;
	const factory = accessQueryPresetFactory('product', c => ({
		canUpdate: c('update', productFactory),
		canDelete: c('delete', productFactory),
		canCreate: c('create', organizationFactory),
		canTruncate: c('truncate', Subject.Global),
		canActivate: c('activate', (value: unknown): value is typeof FOO_BAR => {
			return value === FOO_BAR;
		})
	}));

	it('provided methods are assigned to final object and those methods return access control query params with action and subject', () => {
		expect(factory.canDelete(PRODUCT_REF, PRINCIPAL))
			.toMatchSnapshot();

		expect(factory.canCreate(ORGANIZATION_REF, PRINCIPAL))
			.toMatchSnapshot();

		expect(factory.canUpdate(PRODUCT_REF, PRINCIPAL))
			.toMatchSnapshot();
	});

	it('types', () => {
		type ProductEntityRef = ReturnType<typeof productFactory>;
		type OrganizationEntityRef = ReturnType<typeof organizationFactory>;

		type Factory = typeof factory;

		assert<IsExact<Parameters<Factory['canCreate']>[0], OrganizationEntityRef>>(true);
		assert<IsExact<Parameters<Factory['canDelete']>[0], ProductEntityRef>>(true);
		assert<IsExact<Parameters<Factory['canUpdate']>[0], ProductEntityRef>>(true);

		assert<IsExact<Factory['accessQueryPreset'], AccessQueryPreset<
			['update', ProductEntityRef] | ['delete', ProductEntityRef] | ['create', OrganizationEntityRef] | ['truncate', Subject.Global] | ['activate', typeof FOO_BAR]
		>>>(true);
	});

	it('returned permission set is preconfigured with all methods', () => {
		expect(factory.accessQueryPreset.canHandleQuery(
			factory.canUpdate(PRODUCT_REF, PRINCIPAL),
		)).toBe(true);

		expect(factory.accessQueryPreset.canHandleQuery(
			factory.canDelete(PRODUCT_REF, PRINCIPAL)
		)).toBe(true);

		expect(factory.accessQueryPreset.canHandleQuery(
			factory.canCreate(ORGANIZATION_REF, PRINCIPAL),
		)).toBe(true);

		expect(factory.accessQueryPreset.canHandleQuery(
			factory.canTruncate(Subject.Global.INSTANCE, PRINCIPAL)
		)).toBe(true);

		expect(factory.accessQueryPreset.canHandleQuery(
			factory.canActivate(FOO_BAR, PRINCIPAL)
		)).toBe(true);
	});
});
