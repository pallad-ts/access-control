import {RuleInterface} from "./Rule";
import {Participant} from "./Participant";


export class ACL {
    private rules: Array<RuleInterface>;

    constructor() {
        this.rules = [];
    }

    registerRule(rule: RuleInterface) {
        this.rules.push(rule);
    }

    unregisterRule(rule: RuleInterface) {
        this.rules = this.rules.filter(r => r !== rule);
    }

    isAllowed(participant: Participant, privilege: any, subject: any, callback?: (err: any, result?: boolean) => void) {
        const promise = this._isAllowed(participant, privilege, subject);

        if (callback && callback instanceof Function) {
            promise.then(r => callback(null, r))
                .catch(err => callback(err));
        }
        return promise;
    }

    private _isAllowed(participant: Participant, privilege: any, subject: any): Promise<boolean> {
        return new Promise((resolve) => {
            const rule = this._findRule(privilege, subject);

            if (!rule) {
                resolve(false);
                return;
            }
            resolve(rule.isAllowed(participant, privilege, subject));
        });
    }

    private _findRule(privilege: any, subject: any): RuleInterface {
        let rule;

        this.rules.some((r) => {
            if (r.supports(privilege, subject)) {
                rule = r;
                return true;
            }
        });

        return rule;
    }
}