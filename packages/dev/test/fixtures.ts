import {AccessQuery} from "@pallad/access-control";

export const PRINCIPAL = {some: 'principal'} as const;
export const PRINCIPAL_2 = {some: 'principal_2'} as const;
export const SUBJECT = {some: 'subject'} as const;
export const SUBJECT_2 = {some: 'subject_2'} as const;

export const ACTION = 'foo_action' as const;
export const ACTION_2 = 'foo_action_2' as const;

export const ACCESS_QUERY: AccessQuery = {
	principal: PRINCIPAL,
	action: ACTION,
	subject: SUBJECT
}
