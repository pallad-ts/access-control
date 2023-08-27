import {createFactory} from "@pallad/entity-ref";

export const organizationFactory = createFactory('organization', (id: string) => ({id}));

export type OrganizationRef = ReturnType<typeof organizationFactory>;
export const ORGANIZATION_REF = organizationFactory('organizationId');
export const productFactory = createFactory('product', (id: string, organizationId: string) => ({id, organizationId}));
export type ProductRef = ReturnType<typeof productFactory>;

export const PRODUCT_REF = productFactory('productId', ORGANIZATION_REF.data.id);
