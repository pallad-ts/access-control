import {Principal} from "./AccessQuery";
import {ScopeWorkspace} from "./Scope";
import {AuthorizationError} from '@pallad/common-errors';

export class ACLHelper {

	assertScopeWorkspaceForPrincipal(principal: Principal) {
		const scope = this.getScopeWorkspaceForPrincipal(principal);
		if (!scope) {
			throw new AuthorizationError('Action not available for current principal');
		}
		return scope;
	}

	getScopeWorkspaceForPrincipal(principal: Principal) {
		if (principal instanceof Principal.ImpersonatedUser) {
			return new ScopeWorkspace(principal.targetUser.workspaceId);
		} else if (principal instanceof Principal.User) {
			return new ScopeWorkspace(principal.workspaceId);
		}
	}
}
