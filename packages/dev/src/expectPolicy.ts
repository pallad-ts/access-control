import {AccessQuery, Policy} from "@pallad/access-control";
import {right, left, Either} from '@sweet-monads/either';
import {expect} from '@jest/globals';

function displayAccessQuery(this: jest.MatcherUtils, query: AccessQuery) {
	return this.utils.stringify(query);
}

function policyDoesNotAbstain(this: jest.MatcherUtils, policyVote: boolean | undefined, query: AccessQuery): Either<string, boolean> {
	if (policyVote === undefined) {
		const combination = displayAccessQuery.call(this, query);
		return left(`Policy has abstained from voting for following access query:\n${combination}`)
	}

	return right(policyVote);
}

function messageToMatcherResult(isPass: boolean) {
	return (message: string) => {
		return {
			message: () => message,
			pass: isPass
		}
	}
}


function assertPolicy(value: unknown) {
	if (value instanceof Function) {
		return right(undefined);
	}
	return left('Policy must be a function');
}

expect.extend({
	async policyToAllow(receivedPolicy: Policy, query: AccessQuery) {
		return (
			await assertPolicy(receivedPolicy)
				.asyncChain(async () => {
					return right(await receivedPolicy(query));
				})
		)
			.chain(vote => {
				return policyDoesNotAbstain.call(this, vote, query);
			})
			.chain(vote => {
				const accessQuerySerialized = displayAccessQuery.call(this, query);
				if (vote) {
					return right(`expected to DENY for following combination:\n${accessQuerySerialized}`);
				}
				return left(`expected to ALLOW for following combination:\n${accessQuerySerialized}`);
			})
			.fold(messageToMatcherResult(false), messageToMatcherResult(true));
	},
	async policyToDeny(receivedPolicy: Policy, query: AccessQuery) {
		return (
			await assertPolicy(receivedPolicy)
				.asyncChain(async () => {
					return right(await receivedPolicy(query))
				})
		)
			.chain(vote => {
				return policyDoesNotAbstain.call(this, vote, query);
			})
			.chain(vote => {
				const accessQuerySerialized = displayAccessQuery.call(this, query);
				if (!vote) {
					return right(`expected to ALLOW for following combination:\n${accessQuerySerialized}`);
				}
				return left(`expected to DENY for following combination:\n${accessQuerySerialized}`);
			})
			.fold(messageToMatcherResult(false), messageToMatcherResult(true));
	}
});

declare global {
	namespace jest {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		export interface Matchers<R, T = {}> {
			policyToAllow(accessQuery: AccessQuery): Promise<R>;

			policyToDeny(accessQuery: AccessQuery): Promise<R>;
		}
	}
}

