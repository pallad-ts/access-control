import {EntityRef, Factory} from "@pallad/entity-ref";
import {AccessQuery, Policy} from "@pallad/access-control";
import {SubjectDefinition} from "./types";

export class PermissionSet<T extends [string, unknown]> {
    private entriesActionToSubjectPredicates = new Map<string, Set<SubjectDefinition.TypeGuard<any>>>();

    readonly type!: T;

    constructor(readonly subjectType: string) {

    }

    canHandleQuery({action, subject}: AccessQuery) {
        return this.isValidSubject(subject) && this.isValidSubjectForAction(action, subject.wrappedSubject);
    }

    private isValidSubjectForAction(action: string, subject: unknown) {
        const entityRefFactoriesForPrivilege = this.entriesActionToSubjectPredicates.get(action);
        return Array.from(entityRefFactoriesForPrivilege ?? []).some(typeGuard => typeGuard(subject));
    }

    private isValidSubject(subject: unknown): subject is PermissionSet.Subject<T[1]> {
        // eslint-disable-next-line no-null/no-null
        return typeof subject === 'object' && subject !== null && 'subjectType' in subject && (subject as any).subjectType === this.subjectType;
    }

    wrapSubjectWithSubjectType<T>(wrappedSubject: T): PermissionSet.Subject<T> {
        return Object.freeze({
            wrappedSubject,
            subjectType: this.subjectType
        });
    }

    /**
     * Adds combination of action and subject definition to set of combinations that current permission set can handle
     */
    addEntry<
        TAction extends string,
        TSubjectDefinition extends SubjectDefinition
    >(action: TAction, subjectDefinition: TSubjectDefinition) {
        if (!this.entriesActionToSubjectPredicates.has(action)) {
            this.entriesActionToSubjectPredicates.set(action, new Set());
        }
        this.entriesActionToSubjectPredicates.get(action)!.add(createSubjectPredicateFromSubjectDefinition(subjectDefinition));
        return this;
    }

    /**
     * Returns a policy for provided policy function.
     * Provided policy function is going to ba called only for access query that is matched agains current permission set.
     */
    createPolicy<TPrincipal>(
        policyFunction: Policy<PermissionSet.PolicyAccessQueryInput<TPrincipal, T>>
    ): Policy<PermissionSet.PolicyAccessQueryOutput<TPrincipal, T>> {
        return (query: PermissionSet.PolicyAccessQueryOutput<TPrincipal, T>) => {
            if (this.canHandleQuery(query)) {
                return policyFunction({
                    action: query.action,
                    subject: query.subject.wrappedSubject,
                    principal: query.principal
                } as any);
            }
        }
    }
}


function createSubjectPredicateFromSubjectDefinition(subjectDefinition: SubjectDefinition): SubjectDefinition.TypeGuard<any> {
    if (isEntityRefFactory(subjectDefinition)) {
        return subjectDefinition.is;
    }

    if (isClassFunction(subjectDefinition)) {
        return (value: unknown): value is any => value instanceof subjectDefinition;
    }

    if (typeof subjectDefinition === 'function') {
        return subjectDefinition;
    }

    throw new Error('Invalid subject definition provided. Only EntityRefFactory, class or predicate function allowed');
}

function isEntityRefFactory(subjectDefinition: SubjectDefinition): subjectDefinition is Factory<string, any> {
    return typeof subjectDefinition === 'function' && 'typeName' in subjectDefinition && 'is' in subjectDefinition;
}

function isClassFunction(func: unknown): func is SubjectDefinition.Constructor<any> {
    return typeof func === 'function' && Function.prototype.toString.call(func).startsWith('class ');
}

export namespace PermissionSet {
    export type PolicyAccessQueryInput<TPrincipal, T extends [string, unknown]> =
        T extends [infer TAction extends string, infer TSubject] ?
            AccessQuery<TPrincipal, TAction, TSubject>
            : AccessQuery<TPrincipal>;

    export type PolicyAccessQueryOutput<TPrincipal, T extends [string, unknown]> =
        T extends [infer TAction extends string, infer TSubject] ?
            AccessQuery<TPrincipal, TAction, Subject<TSubject>>
            : AccessQuery<TPrincipal>;

    export interface Subject<TRealSubject> {
        readonly subjectType: string;
        readonly wrappedSubject: TRealSubject;
    }

    export interface AccessQueryParams<TAction extends string, TEntityRef extends EntityRef<string, {}>> {
        action: TAction;
        subject: Subject<TEntityRef>;
    }

    export type SubjectPredicate = (value: unknown) => boolean;
}




