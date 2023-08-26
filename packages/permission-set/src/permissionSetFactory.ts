import {EntityRef, Factory} from "@pallad/entity-ref";
import {PermissionSet} from "./PermissionSet";

export function permissionSetFactory<T extends Record<string, readonly [string, Factory<string, any>]>>(name: string, methods: T) {

	const permissionSet = new PermissionSet(name);

	const result: any = {
		permissionSet,
		createPolicy: permissionSet.createPolicy.bind(permissionSet)
	};

	for (const [method, [action, entityRefFactory]] of Object.entries(methods)) {
		(permissionSet as any)[method] = (entityRef: any): PermissionSet.AccessQueryParams<string, any> => {
			return {action, subject: permissionSet.wrapEntityRefWithSubject(entityRef)};
		}
	}

	return result;
}

export namespace permissionSetFactory {
	tye
}

