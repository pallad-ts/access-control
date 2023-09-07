import {AccessControl, Principal as _Principal, Subject as _Subject} from "@pallad/access-control";
import {Principal, Action, Subject} from './AccessQueryElements';

export const accessControl = new AccessControl<Principal, Action, Subject>();

const allowedActionsForArticle = new Set<Action>([
	'update',
	'read',
	'read-draft',
	'create',
	'publish',
	'delete'
]);

accessControl
	.registerPolicy(({action, subject, principal}) => {
		if (_Principal.Anonymous.is(principal)) {
			// allow to read if subject is `article`
			return action === 'read' && subject === 'article';
		}
	})
	.registerPolicy(({action, subject, principal}) => {
		if (principal === 'logged-in') {
			// testing against set of allowed actions is needed to
			// prevent accidentally accepting actions that might be added to the system in future
			return allowedActionsForArticle.has(action) && subject === 'article';
		}
	});


export type OurAccessControl = typeof accessControl;
