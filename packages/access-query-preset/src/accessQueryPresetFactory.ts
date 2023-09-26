import {AccessQueryPreset} from "./AccessQueryPreset";
import {InferSubjectFromDefinition, SubjectDefinition} from "./types";
import {AccessQuery} from "@pallad/access-control";

export function accessQueryPresetFactory<T extends Record<string, AccessQueryPreset.Entry<any, any>>>(
	name: string, methods: T | ((createEntry: typeof accessQueryCombination) => T)
) {

	const accessQueryPreset = new AccessQueryPreset(name);
	const result: any = {
		accessQueryPreset,
	};

	const finalMethods = methods instanceof Function ? methods(accessQueryCombination) : methods;
	for (const [method, entry] of Object.entries(finalMethods)) {
		accessQueryPreset.addEntry(entry);
		result[method] = (subject: any, principal: any) => {
			return {action: entry.action, subject: accessQueryPreset.wrapSubjectWithSubjectType(subject), principal};
		}
	}

	return result as AccessQueryPresetFactory<AccessQueryPresetFactory.FunctionResultOfObject<T>>;
}

export function accessQueryCombination<
	TAction extends string,
	TSubject extends SubjectDefinition
>(action: TAction, subjectDefinition: TSubject): AccessQueryPreset.Entry<TAction, TSubject> {
	return {action, subjectDefinition} as const;
}

export type AccessQueryPresetFactory<T extends Record<string, AccessQueryPreset.Entry<any, any>>> = {
	accessQueryPreset: AccessQueryPreset<AccessQueryPresetFactory.MethodsToAccessQueryParamsUnion<T[keyof T]>>,
} & {
	[TKey in keyof T]: <
		TSubject extends InferSubjectFromDefinition<T[TKey]['subjectDefinition']>,
		TPrincipal
	>(subject: TSubject, principal: TPrincipal) => AccessQuery<TPrincipal, T[TKey]['action'], TSubject>
}


export namespace AccessQueryPresetFactory {
	export type FunctionResultOfObject<T> = T extends () => any ? ReturnType<T> : T;


	export type MethodsToAccessQueryParamsUnion<T extends AccessQueryPreset.Entry<any, any>> =
		T extends AccessQueryPreset.Entry<infer TAction extends string, infer TSubjectDefinition extends SubjectDefinition> ?
			[TAction, InferSubjectFromDefinition<TSubjectDefinition>]
			: never;
}

