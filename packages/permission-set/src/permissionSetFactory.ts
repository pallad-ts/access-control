import {Factory} from "@pallad/entity-ref";
import {PermissionSet} from "./PermissionSet";

export function permissionSetFactory<T extends Record<string, readonly [string, Factory<string, any>]>>(name: string, methods: T) {

    const permissionSet = new PermissionSet(name);

    const result: any = {
        permissionSet,
    };

    for (const [method, [action, entityRefFactory]] of Object.entries(methods)) {
        result[method] = (entityRef: any): PermissionSet.AccessQueryParams<string, any> => {
            return {action, subject: permissionSet.wrapEntityRefWithSubject(entityRef)};
        }
    }

    return result as permissionSetFactory.PermissionSetPreset<T>;
}

export namespace permissionSetFactory {
    export type PermissionSetPreset<T extends Record<string, readonly [string, Factory<string, any>]>> = {
        permissionSet: PermissionSet<MethodsToAccessQueryParamsUnion<T[keyof T]>>,
    } & {
        [TKey in keyof T]: (ref: ReturnType<T[TKey][1]>) => PermissionSet.AccessQueryParams<T[TKey][0], ReturnType<T[TKey][1]>>
    }
=
    export type MethodsToAccessQueryParamsUnion<T extends readonly [string, Factory<string, any>]> =
        T extends readonly [infer TAction, infer TEntityRefFactory] ?
            (TEntityRefFactory extends Factory<string, any> ?
                (TAction extends string ? [TAction, ReturnType<TEntityRefFactory>] : never)
                : never)
            : never;
}


