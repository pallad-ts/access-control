import {AccessQuery} from "@pallad/access-control";

const deepEqual = require('deep-equal');

const ALWAYS_TRUE = () => true;

export class StubMatcher {
	private principalList = new Set<StubMatcher.Matcher<unknown>>();
	private actionList = new Set<StubMatcher.Matcher<string>>();
	private subjectList = new Set<StubMatcher.Matcher<unknown>>();

	anyAccessQuery() {
		return this.anyPrincipal()
			.anyAction()
			.anySubject()
	}

	anyPrincipal(): this {
		this.principalList.add(ALWAYS_TRUE);
		return this;
	}

	principal(...principal: Array<unknown | ((principal: unknown) => boolean)>): this {
		for (const x of principal) {
			this.principalList.add(x);
		}
		return this;
	}

	anyAction(): this {
		this.actionList.add(ALWAYS_TRUE);
		return this;
	}

	action(...action: Array<string | ((action: string) => boolean)>): this {
		for (const x of action) {
			this.actionList.add(x);
		}
		return this;
	}

	anySubject(): this {
		this.subjectList.add(ALWAYS_TRUE);
		return this;
	}

	subject(...subject: Array<unknown | ((subject: unknown) => boolean)>): this {
		for (const x of subject) {
			this.subjectList.add(x);
		}
		return this;
	}

	matchAccessQuery(query: AccessQuery): boolean {
		return this.matchPrincipal(query.principal) && this.matchAction(query.action) && this.matchSubject(query.subject);
	}

	private matchPrincipal(principal: unknown) {
		this.assertIsConfigured(this.principalList, 'No principal matcher defined. Define list of principals or use `anyParticipant` to match any participant');
		return !!Array.from(this.principalList).find(x => {
			if (x instanceof Function) {
				return x(principal);
			}

			return x === principal || deepEqual(x, principal);
		})
	}

	private assertIsConfigured(set: Set<any>, errorMessage: string) {
		if (set.size === 0) {
			throw new Error(errorMessage);
		}
	}

	private matchAction(action: string) {
		this.assertIsConfigured(this.actionList, 'No action matcher defined. Define list of actions or use `anyAction` to match any action');
		return !!Array.from(this.actionList).find(x => {
			if (x instanceof Function) {
				return x(action);
			}

			return x === action;
		})
	}

	private matchSubject(subject: unknown) {
		this.assertIsConfigured(this.subjectList, 'No subject matcher defined. Define list of subjects or use `anySubject` to match any subject');
		return !!Array.from(this.subjectList).find(x => {
			if (x instanceof Function) {
				return x(subject);
			}

			return x === subject || deepEqual(x, subject);
		})
	}
}

export namespace StubMatcher {
	export type Matcher<T> = T | ((arg: T) => boolean);
}
