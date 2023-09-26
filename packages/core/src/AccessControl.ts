import {Policy} from "./Policy";
import {AccessDeniedError} from "./AccessDeniedError";
import {AccessQuery} from "./AccessQuery";

export class AccessControl<TPrincipal = unknown, TAction extends string = string, TSubject = unknown> {
	private policies = new Set<Policy<any>>();

	registerPolicy<TAccessQuery extends AccessQuery<TPrincipal, TAction, TSubject>>(policy: Policy<TAccessQuery>): this {
		this.policies.add(policy);
		return this;
	}

	deregisterRule<TAccessQuery extends AccessQuery<TPrincipal, TAction, TSubject>>(policy: Policy<TAccessQuery>): this {
		this.policies.delete(policy);
		return this;
	}

	async assertIsAllowed(
		request: AccessQuery<TPrincipal, TAction, TSubject>,
		errorFactory?: (request: AccessQuery) => unknown) {
		const isAllowed = await this.isAllowed(request);
		if (!isAllowed) {
			throw (errorFactory ? errorFactory(request) : new AccessDeniedError());
		}
		return true;
	}

	async isAllowed(request: AccessQuery<TPrincipal, TAction, TSubject>): Promise<boolean> {
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
