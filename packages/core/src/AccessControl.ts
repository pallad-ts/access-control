import {Rule} from "./Rule";
import {AccessDeniedError} from "./AccessDeniedError";

export class AccessControl {
    private rules: Set<Rule> = new Set();

    registerRule(rule: Rule): this {
        this.rules.add(rule);
        return this;
    }

    unregisterRule(rule: Rule): this {
        this.rules.delete(rule);
        return this;
    }

    async assertAccess(participant: any,
                       privilege: any,
                       subject: any,
                       errorMessage?: string) {
        const isAllowed = await this.isAllowed(participant, privilege, subject);
        if (!isAllowed) {
            throw new AccessDeniedError(errorMessage);
        }
        return true;
    }

    async isAllowed(participant: any,
                    privilege: any,
                    subject: any) {
        const rule = this.findRule(privilege, subject);
        if (!rule) {
            return false;
        }
        return rule.isAllowed(participant, privilege, subject);
    }

    private findRule(privilege: any, subject: any): Rule | undefined {
        for (const rule of this.rules) {
            if (rule.supports(privilege, subject)) {
                return rule;
            }
        }
    }
}