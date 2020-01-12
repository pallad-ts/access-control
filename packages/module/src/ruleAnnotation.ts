export function ruleAnnotation() {
    return {
        name: NAME
    };
}
const NAME = 'alpha-ac/rule';
export const PREDICATE = (a: any) => a && a.name === NAME;