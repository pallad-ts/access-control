import {EntityRef, Factory} from "@pallad/entity-ref";
import {AccessQuery, Policy} from "@pallad/access-control";

export class PermissionSet<T extends [string, EntityRef<string, {}>]> {
	private entries = new Map<string, Set<Factory<string, any>>>();
	private entityRefTypes = new Set<string>();

	readonly type!: T;

	constructor(readonly subjectType: string) {

	}

	canHandleQuery({action, subject}: AccessQuery) {
		return this.isValidSubject(subject) && this.isValidEntityRefForAction(action, subject.entityRef);
	}

	isValidEntityRefForAction(action: string, entityRef: EntityRef<string, any>) {
		const entityRefFactoriesForPrivilege = this.entries.get(action);
		return Array.from(entityRefFactoriesForPrivilege ?? []).some(x => x.is(entityRef));
	}

	isValidSubject(subject: unknown): subject is PermissionSet.Subject<T[1]> {
		// eslint-disable-next-line no-null/no-null
		return typeof subject === 'object' && subject !== null && 'subjectType' in subject && (subject as any).subjectType === this.subjectType;
	}

	wrapEntityRefWithSubject(entityRef: T[1]): PermissionSet.Subject<T[1]> {
		return Object.freeze({
			entityRef,
			subjectType: this.subjectType
		});
	}

	addEntry<
		TAction extends string,
		TEntityFactory extends Factory<string, any>
	>(action: TAction, entityRefFactory: TEntityFactory) {
		this.entityRefTypes.add(entityRefFactory.typeName);
		if (!this.entries.has(action)) {
			this.entries.set(action, new Set());
		}
		this.entries.get(action)!.add(entityRefFactory);
		return this;
	}

	createPolicy<TPrincipal>(
		policyFunction: Policy<PermissionSet.PolicyAccessQuery<TPrincipal, T>>
	): Policy<PermissionSet.PolicyAccessQuery<TPrincipal, T>> {
		return (query: PermissionSet.PolicyAccessQuery<TPrincipal, T>) => {
			if (this.canHandleQuery(query)) {
				return policyFunction(query);
			}
		}
	}
}

export namespace PermissionSet {
	export type PolicyAccessQuery<TPrincipal, T extends [string, EntityRef<string, {}>]> = T extends [infer TAction, infer TEntityRef] ? (TAction extends string ? AccessQuery<TPrincipal, TAction, TEntityRef> : AccessQuery<TPrincipal>) : AccessQuery<TPrincipal>;

	export interface Subject<TEntityRef extends EntityRef<unknown, {}>> {
		readonly subjectType: string;
		readonly entityRef: TEntityRef;
	}

	export interface AccessQueryParams<TAction extends string, TEntityRef extends EntityRef<unknown, {}>> {
		action: TAction;
		subject: Subject<TEntityRef>;
	}
}


