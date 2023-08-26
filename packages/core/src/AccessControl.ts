import {Policy} from "./Policy";
import {AccessDeniedError} from "./AccessDeniedError";
import {AccessQuery} from "./AccessQuery";

export class AccessControl<TPrincipal = unknown, TAction extends string = string, TSubject = unknown> {
    private policies = new Set<Policy<AccessQuery<TPrincipal, TAction, TSubject>>>();

    registerPolicy(policy: Policy<AccessQuery<TPrincipal, TAction, TSubject>>): this {
        this.policies.add(policy);
        return this;
    }

    deregisterRule(policy: Policy<AccessQuery<TPrincipal, TAction, TSubject>>): this {
        this.policies.delete(policy);
        return this;
    }

    async assertGranted(
        request: AccessQuery<TPrincipal, TAction, TSubject>,
        errorFactory?: (request: AccessQuery) => unknown) {
        const isAllowed = await this.isGranted(request);
        if (!isAllowed) {
            throw (errorFactory ? errorFactory(request) : new AccessDeniedError());
        }
        return true;
    }

    async isGranted(request: AccessQuery<TPrincipal, TAction, TSubject>): Promise<boolean> {
        const voteResults = await Promise.all(
            Array.from(this.policies).map(policy => {
                return policy(request);
            })
        );

        let isGranted = false;
        for (const voteResult of voteResults) {
            if (voteResult === false) {
                return false;
            } else if (voteResult === true) {
                isGranted = true;
            }
        }
        return isGranted;
    }
}
