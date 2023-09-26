import {AccessQueryPreset, Principal, Subject} from "./AccessQuery";
import {AccessControl, BasicSubject} from "@pallad/access-control";
import {ACLHelper} from "./ACLHelper";
import {ArticleRepository, Article} from "./ArticleRepository";
import {ScopeUnsafeGlobal} from "./Scope";

export class ArticleService {
	constructor(private accessControl: AccessControl,
				private aclHelper: ACLHelper,
				private articleRepository: ArticleRepository) {
	}

	async findAll(principal: Principal) {
		await this.accessControl.assertIsAllowed(
			AccessQueryPreset.Article.canRead(BasicSubject.Global.INSTANCE, principal)
		);

		const workspaceScope = this.aclHelper.getScopeWorkspaceForPrincipal(principal);
		const canReadDraft = workspaceScope ? await this.accessControl.isAllowed(
			AccessQueryPreset.Article.canReadDraft(Subject.Workspace.fromScope(workspaceScope), principal)
		) : false;

		return this.articleRepository.findAll(ScopeUnsafeGlobal.INSTANCE, {
			draftForWorkspaceId: canReadDraft ? workspaceScope?.workspaceId : undefined
		})
	}

	async create(principal: Principal, input: Article.Input) {
		const scope = this.aclHelper.assertScopeWorkspaceForPrincipal(principal);
		const subject = Subject.Workspace.fromScope(scope);
		await this.accessControl.assertIsAllowed(
			AccessQueryPreset.Article.canCreate(subject, principal)
		);
		return this.articleRepository.create(scope, input);
	}

	async update(principal: Principal, id: number, input: Article.Input) {
		const scope = this.aclHelper.assertScopeWorkspaceForPrincipal(principal);

		const article = this.articleRepository.assertById(scope, id);
		await this.accessControl.assertIsAllowed(
			AccessQueryPreset.Article.canUpdate(Subject.Article.fromEntity(article), principal)
		);

		return this.articleRepository.update(scope, id, input);
	}

	async delete(principal: Principal, id: number) {
		const scope = this.aclHelper.assertScopeWorkspaceForPrincipal(principal);

		const article = this.articleRepository.assertById(scope, id);
		await this.accessControl.assertIsAllowed(
			AccessQueryPreset.Article.canDelete(Subject.Article.fromEntity(article), principal)
		);

		return this.articleRepository.delete(scope, id);
	}

	async publish(principal: Principal, id: number) {
		const scope = this.aclHelper.assertScopeWorkspaceForPrincipal(principal);

		const article = this.articleRepository.assertById(scope, id);
		await this.accessControl.assertIsAllowed(
			AccessQueryPreset.Article.canPublish(Subject.Article.fromEntity(article), principal)
		);

		return this.articleRepository.publish(scope, id);
	}
}
