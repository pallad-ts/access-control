import * as is from 'predicates';
import {Rule} from "alpha-ac";

const assertRule = is.assert(
    is.struct({
        supports: is.func,
        isAllowed: is.func
    }),
    'Provided object does not look like Rule ("supports" and "isAllowed" methods)'
);

function displayPermissionSubjectCombination(this: any, permission: any, subject: any) {
    return `Permission: ${this.utils.stringify(permission)}\nSubject: ${this.utils.stringify(subject)}`;
}

function displayFullCombination(this: any, participant: any, permission: any, subject: any) {
    return `Participant: ${this.utils.stringify(participant)}\n${displayPermissionSubjectCombination(permission, subject)}`;
}

function assertSupports(this: any, rule: Rule, permission: any, subject: any) {
    const isSupported = rule.supports(permission, subject);
    if (!isSupported) {
        return {
            message: () => {
                const combination = displayPermissionSubjectCombination.call(this, permission, subject);
                return `Rule does not support following combination:\n${combination}`;
            },
            pass: false
        }
    }
}

expect.extend({
    async ruleToAllow(received: Rule, participant: any, permission: any, subject: any) {
        assertRule(received);

        const doesNotSupport = assertSupports.call(this, received, permission, subject);
        if (doesNotSupport) {
            return doesNotSupport;
        }

        const pass = await received.isAllowed(participant, permission, subject);
        const combination = displayFullCombination.call(this, participant, permission, subject);
        if (pass) {
            return {
                message: () => {
                    return `expected NOT to ALLOW for following combination:\n${combination}`
                },
                pass: true
            }
        }
        return {
            message: () => {
                return `expected to ALLOW for following combination:\n${combination}`;
            },
            pass: false
        }
    },
    async ruleToDeny(received: Rule, participant: any, permission: any, subject: any) {
        assertRule(received);
        const doesNotSupport = assertSupports.call(this, received, permission, subject);
        if (doesNotSupport) {
            return doesNotSupport;
        }

        const pass = !(await received.isAllowed(participant, permission, subject));
        const combination = displayFullCombination.call(this, participant, permission, subject);
        if (pass) {
            return {
                message: () => {
                    return `expected NOT to DENY for following combination:\n${combination}`
                },
                pass: true
            }
        }
        return {
            message: () => {
                return `expected to DENY for following combination:\n${combination}`;
            },
            pass: false
        }
    }
});


declare namespace jest {
    interface Matchers<R> {
        ruleToDeny(participant: any, permission: any, subject: any): R;

        ruleToAllow(participant: any, permission: any, subject: any): R;
    }
}
