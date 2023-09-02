import {PermissionSet} from "./PermissionSet";
import {InferSubjectFromDefinition, SubjectDefinition} from "./types";

export function permissionSetPresetFactory<T extends Record<string, readonly [string, SubjectDefinition]>>(name: string, methods: T) {

    const permissionSet = new PermissionSet(name);
    const result: any = {
        permissionSet,
    };

    for (const [method, [action, subjectDefinition]] of Object.entries(methods)) {
        permissionSet.addEntry(action, subjectDefinition);
        result[method] = (subject: any): PermissionSet.AccessQueryParams<string, any> => {
            return {action, subject: permissionSet.wrapSubjectWithSubjectType(subject)};
        }
    }

    return result as PermissionSetPreset<T>;
}


export type PermissionSetPreset<T extends Record<string, readonly [string, SubjectDefinition]>> = {
    permissionSet: PermissionSet<MethodsToAccessQueryParamsUnion<T[keyof T]>>,
} & {
    [TKey in keyof T]: (ref: InferSubjectFromDefinition<T[TKey][1]>) => PermissionSet.AccessQueryParams<T[TKey][0], InferSubjectFromDefinition<T[TKey][1]>>
}

export type MethodsToAccessQueryParamsUnion<T extends readonly [string, SubjectDefinition]> =
    T extends readonly [infer TAction extends string, infer TSubjectDefinition extends SubjectDefinition] ?
        [TAction, InferSubjectFromDefinition<TSubjectDefinition>]
        : never;
