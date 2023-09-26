import {createFactory} from '@pallad/entity-ref';
import {Article as ArticleEntity} from "./ArticleRepository";
import {accessQueryPresetFactory} from "@pallad/access-control-query-preset";
import {BasicPrincipal, BasicSubject} from "@pallad/access-control";
import {ScopeWorkspace} from "./Scope";

export namespace Subject {
	export const Article = createFactory(
		'article',
		(id: number, workspaceId: number) => ({id, workspaceId}),
		{
			fromEntity(article: ArticleEntity) {
				return {
					workspaceId: article.workspaceId,
					id: article.id
				}
			}
		}
	);

	export const Workspace = createFactory(
		'workspace',
		(id: number) => ({id}),
		{
			fromScope(scope: ScopeWorkspace) {
				return {id: scope.workspaceId};
			}
		}
	);
}

export namespace AccessQueryPreset {
	export const Article = accessQueryPresetFactory('article', c => ({
		canCreate: c('create', Subject.Workspace),
		canUpdate: c('update', Subject.Article),
		canPublish: c('publish', Subject.Article),
		canDelete: c('delete', Subject.Article),

		canReadDraft: c('read-draft', Subject.Workspace), // can read draft articles only from workspace

		// note that we allow to read articles from literally all workspaces without limits
		// that is why using `Subject.Workspace` is pointless and `Global` subject is needed
		canRead: c('read', BasicSubject.Global), // can read articles in general
	}))
}

export type Principal = Principal.ImpersonatedUser | Principal.User | BasicPrincipal.Anonymous;
export namespace Principal {
	export class User {
		readonly kind = 'principal';
		readonly type = 'user';

		constructor(readonly id: number, readonly workspaceId: number) {
			Object.freeze(this);
		}
	}

	export class ImpersonatedUser {
		readonly kind = 'principal';
		readonly type = 'impersonated-user';

		constructor(readonly impersonatorUsername: string, readonly targetUser: User) {
			Object.freeze(this);
		}
	}
}
