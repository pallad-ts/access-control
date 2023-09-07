import {Factory as EntityRefFactory} from '@pallad/entity-ref';

export type SubjectDefinition = EntityRefFactory<string, any> | SubjectDefinition.Constructor<any> | SubjectDefinition.TypeGuard<any>;
export namespace SubjectDefinition {

    export interface Constructor<T extends object> {
        new(...args: any[]): T
    }

    export interface TypeGuard<T extends object> {
        (value: any): value is T;
    }
}


export type InferSubjectFromDefinition<T extends SubjectDefinition> = T extends EntityRefFactory<string, any> ? ReturnType<T> : (
    T extends SubjectDefinition.Constructor<infer TType> ? TType : (
        T extends SubjectDefinition.TypeGuard<infer TType> ? TType : never
        )
    )
