import {AccessQueryPreset} from "./AccessQueryPreset";
import {InferSubjectFromDefinition, SubjectDefinition} from "./types";
import {AccessQuery} from "@pallad/access-control";

export function accessQueryPresetFactory<T extends Record<string, readonly [string, SubjectDefinition]>>(name: string, methods: T) {

	const accessQueryPreset = new AccessQueryPreset(name);
	const result: any = {
		accessQueryPreset,
	};

	for (const [method, [action, subjectDefinition]] of Object.entries(methods)) {
		accessQueryPreset.addEntry(action, subjectDefinition);
		result[method] = (subject: any, principal: any) => {
			return {action, subject: accessQueryPreset.wrapSubjectWithSubjectType(subject), principal};
		}
	}

	return result as AccessQueryPresetFactory<T>;
}


export type AccessQueryPresetFactory<T extends Record<string, readonly [string, SubjectDefinition]>> = {
	accessQueryPreset: AccessQueryPreset<MethodsToAccessQueryParamsUnion<T[keyof T]>>,
} & {
	[TKey in keyof T]: <
		TSubject extends InferSubjectFromDefinition<T[TKey][1]>,
		TPrincipal
	>(subject: TSubject, principal: TPrincipal) => AccessQuery<TPrincipal, T[TKey][0], TSubject>
}

export type MethodsToAccessQueryParamsUnion<T extends readonly [string, SubjectDefinition]> =
	T extends readonly [infer TAction extends string, infer TSubjectDefinition extends SubjectDefinition] ?
		[TAction, InferSubjectFromDefinition<TSubjectDefinition>]
		: never;
