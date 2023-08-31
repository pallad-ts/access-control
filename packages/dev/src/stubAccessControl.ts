import {AccessControl, AccessQuery} from "@pallad/access-control";
import {StubMatcher} from "./StubMatcher";


export function stubAccessControl<T extends AccessControl>(accessControl: T): stubAccessControl.Stubbed<T> {
	const matchers: StubMatcher[] = [];

	const result = accessControl as stubAccessControl.Stubbed<T>;
	result.allowFor = () => {
		const matcher = new StubMatcher();
		matchers.push(matcher);
		return matcher;
	};

	// eslint-disable-next-line @typescript-eslint/require-await
	result.isAllowed = async (query: AccessQuery) => {
		for (const matcher of matchers) {
			if (matcher.matchAccessQuery(query)) {
				return true;
			}
		}
		return false;
	};
	return result;
}


export namespace stubAccessControl {
	export type Stubbed<T extends AccessControl> = T & {
		allowFor: () => StubMatcher;
	}
}

