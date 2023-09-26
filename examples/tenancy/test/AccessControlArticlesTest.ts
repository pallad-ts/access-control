import {AccessQueryPreset, Principal, Subject} from "@src/AccessQuery";
import {AccessQuery, BasicSubject, BasicPrincipal} from "@pallad/access-control";
import {accessControl} from "@src/AccessControl";

const WORKSPACE_MAIN = Subject.Workspace(1);
const ARTICLE_FROM_MAIN_WORKSPACE = Subject.Article(1, WORKSPACE_MAIN.data.id);

const WORKSPACE_FOREIGN = Subject.Workspace(2);
const ARTICLE_FROM_FOREIGN_WORKSPACE = Subject.Article(2, WORKSPACE_FOREIGN.data.id);
describe('AccessControl - Articles', () => {
	describe('anonymous user', () => {
		const principal = BasicPrincipal.Anonymous.INSTANCE;
		it.each<[string, AccessQuery, boolean]>([
			[
				'can read articles',
				AccessQueryPreset.Article.canRead(BasicSubject.Global.INSTANCE, principal),
				true
			],
			[
				'can read articles from another workspace',
				AccessQueryPreset.Article.canRead(BasicSubject.Global.INSTANCE, principal),
				true
			],
			[
				'cannot read draft',
				AccessQueryPreset.Article.canReadDraft(WORKSPACE_MAIN, principal),
				false
			],
			[
				'cannot read draft from another workspace',
				AccessQueryPreset.Article.canReadDraft(WORKSPACE_FOREIGN, principal),
				false
			],
			[
				'cannot publish',
				AccessQueryPreset.Article.canPublish(ARTICLE_FROM_MAIN_WORKSPACE, principal),
				false
			],
			[
				'cannot publish from another workspace',
				AccessQueryPreset.Article.canPublish(ARTICLE_FROM_FOREIGN_WORKSPACE, principal),
				false
			],
			[
				'cannot update',
				AccessQueryPreset.Article.canDelete(ARTICLE_FROM_MAIN_WORKSPACE, principal),
				false
			],
			[
				'cannot delete from another workspace',
				AccessQueryPreset.Article.canDelete(ARTICLE_FROM_FOREIGN_WORKSPACE, principal),
				false
			],
			[
				'cannot update',
				AccessQueryPreset.Article.canUpdate(ARTICLE_FROM_MAIN_WORKSPACE, principal),
				false
			],
			[
				'cannot update in another workspace',
				AccessQueryPreset.Article.canUpdate(ARTICLE_FROM_FOREIGN_WORKSPACE, principal),
				false
			],
			[
				'cannot create',
				AccessQueryPreset.Article.canCreate(WORKSPACE_MAIN, principal),
				false
			],
			[
				'cannot create in another workspace',
				AccessQueryPreset.Article.canCreate(WORKSPACE_FOREIGN, principal),
				false
			],
		])('%s', (description, query, expected) => {
			return expect(accessControl.isAllowed(query))
				.resolves
				.toBe(expected);
		});
	});

	describe('authenticated user', () => {
		const principal = new Principal.User(10, WORKSPACE_MAIN.data.id);
		it.each<[string, AccessQuery, boolean]>([
			[
				'can read articles',
				AccessQueryPreset.Article.canRead(BasicSubject.Global.INSTANCE, principal),
				true
			],
			[
				'can read articles from another workspace',
				AccessQueryPreset.Article.canRead(BasicSubject.Global.INSTANCE, principal),
				true
			],
			[
				'can read draft',
				AccessQueryPreset.Article.canReadDraft(WORKSPACE_MAIN, principal),
				true
			],
			[
				'cannot read draft from another workspace',
				AccessQueryPreset.Article.canReadDraft(WORKSPACE_FOREIGN, principal),
				false
			],
			[
				'can publish',
				AccessQueryPreset.Article.canPublish(ARTICLE_FROM_MAIN_WORKSPACE, principal),
				true
			],
			[
				'cannot publish from another workspace',
				AccessQueryPreset.Article.canPublish(ARTICLE_FROM_FOREIGN_WORKSPACE, principal),
				false
			],
			[
				'can update',
				AccessQueryPreset.Article.canDelete(ARTICLE_FROM_MAIN_WORKSPACE, principal),
				true
			],
			[
				'cannot delete from another workspace',
				AccessQueryPreset.Article.canDelete(ARTICLE_FROM_FOREIGN_WORKSPACE, principal),
				false
			],
			[
				'can update',
				AccessQueryPreset.Article.canUpdate(ARTICLE_FROM_MAIN_WORKSPACE, principal),
				true
			],
			[
				'cannot update in another workspace',
				AccessQueryPreset.Article.canUpdate(ARTICLE_FROM_FOREIGN_WORKSPACE, principal),
				false
			],
			[
				'can create',
				AccessQueryPreset.Article.canCreate(WORKSPACE_MAIN, principal),
				true
			],
			[
				'cannot create in another workspace',
				AccessQueryPreset.Article.canCreate(WORKSPACE_FOREIGN, principal),
				false
			],
		])('%s', (description, query, expected) => {
			return expect(accessControl.isAllowed(query))
				.resolves
				.toBe(expected);
		});
	});

	describe('impersonated user', () => {
		const principal = new Principal.ImpersonatedUser(
			'admin',
			new Principal.User(10, WORKSPACE_MAIN.data.id)
		);
		it.each<[string, AccessQuery, boolean]>([
			[
				'can read articles',
				AccessQueryPreset.Article.canRead(BasicSubject.Global.INSTANCE, principal),
				true
			],
			[
				'can read articles from another workspace',
				AccessQueryPreset.Article.canRead(BasicSubject.Global.INSTANCE, principal),
				true
			],
			[
				'can read draft',
				AccessQueryPreset.Article.canReadDraft(WORKSPACE_MAIN, principal),
				true
			],
			[
				'cannot read draft from another workspace',
				AccessQueryPreset.Article.canReadDraft(WORKSPACE_FOREIGN, principal),
				false
			],
			[
				'cannot publish',
				AccessQueryPreset.Article.canPublish(ARTICLE_FROM_MAIN_WORKSPACE, principal),
				false
			],
			[
				'cannot publish from another workspace',
				AccessQueryPreset.Article.canPublish(ARTICLE_FROM_FOREIGN_WORKSPACE, principal),
				false
			],
			[
				'can update',
				AccessQueryPreset.Article.canDelete(ARTICLE_FROM_MAIN_WORKSPACE, principal),
				true
			],
			[
				'cannot delete from another workspace',
				AccessQueryPreset.Article.canDelete(ARTICLE_FROM_FOREIGN_WORKSPACE, principal),
				false
			],
			[
				'can update',
				AccessQueryPreset.Article.canUpdate(ARTICLE_FROM_MAIN_WORKSPACE, principal),
				true
			],
			[
				'cannot update in another workspace',
				AccessQueryPreset.Article.canUpdate(ARTICLE_FROM_FOREIGN_WORKSPACE, principal),
				false
			],
			[
				'can create',
				AccessQueryPreset.Article.canCreate(WORKSPACE_MAIN, principal),
				true
			],
			[
				'cannot create in another workspace',
				AccessQueryPreset.Article.canCreate(WORKSPACE_FOREIGN, principal),
				false
			],
		])('%s', (description, query, expected) => {
			return expect(accessControl.isAllowed(query))
				.resolves
				.toBe(expected);
		});
	});
})
