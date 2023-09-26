import {AccessControl} from "@pallad/access-control";
import {AccessQueryPreset, Principal, Subject} from "./AccessQuery";

export const accessControl = new AccessControl<any, string, any>();

accessControl.registerPolicy(
	AccessQueryPreset
		.Article
		.accessQueryPreset
		.createPolicy(({action, subject, principal}) => {
			if (action === 'read') {
				return true;
			}

			// for impersonated and authenticated user allow only if actions are run against same workspace
			const workspaceId = Subject.Workspace.is(subject) ? subject.data.id : subject.data.workspaceId;
			if (principal instanceof Principal.ImpersonatedUser) {
				// and impersonated user can't
				return workspaceId === principal.targetUser.workspaceId && action !== 'publish';
			} else if (principal instanceof Principal.User) {
				return workspaceId === principal.workspaceId;
			}
		})
)



