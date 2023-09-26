import {ScopeUnsafeGlobal, ScopeWorkspace} from "./Scope";
import {NotFoundError} from '@pallad/common-errors';


let articleId = 1;
let articles: Article[] = [{
	id: articleId++,
	workspaceId: 1,
	title: 'Article 1',
	content: 'Article 1 content',
	isPublished: false
}, {
	id: articleId++,
	title: 'Article 2',
	workspaceId: 2,
	content: 'Article 2 content',
	isPublished: true
}, {
	id: articleId++,
	title: 'Article 3',
	workspaceId: 2,
	content: 'Article 3 content',
	isPublished: false
}];

export interface Article {
	id: number;
	title: string;
	workspaceId: number;
	content: string;
	isPublished: boolean;
}

export namespace Article {
	export type Input = Omit<Article, 'id' | 'isPublished' | 'workspaceId'>;
}

export interface ArticleQuery {
	draftForWorkspaceId?: number;
}

function getArticlesFromScope(scope: ScopeWorkspace | ScopeUnsafeGlobal) {
	if (scope instanceof ScopeUnsafeGlobal) {
		return articles;
	}
	return articles.filter(x => x.workspaceId === scope.workspaceId);
}

export class ArticleRepository {
	findAll(scope: ScopeWorkspace | ScopeUnsafeGlobal, {draftForWorkspaceId}: ArticleQuery) {
		const articles = getArticlesFromScope(scope);

		return articles.filter(article => {
			const isDraft = !article.isPublished;
			return article.isPublished || (isDraft && draftForWorkspaceId === article.workspaceId);
		})
	}

	create(scope: ScopeWorkspace, input: Article.Input) {
		const article = {
			id: articleId++,
			...input,
			isPublished: false,
			workspaceId: scope.workspaceId
		};
		articles.push(article);
		return article;
	}

	update(scope: ScopeWorkspace, id: number, input: Article.Input) {
		const article = this.findById(scope, id);
		if (article) {
			if (input.title) {
				article.title = input.title;
			}
			if (input.content) {
				article.content = input.content;
			}
		}
		return article;
	}

	publish(scope: ScopeWorkspace, id: number) {
		const article = this.findById(scope, id);
		if (article) {
			article.isPublished = true;
		}
		return article;
	}

	delete(scope: ScopeWorkspace, id: number) {
		const article = this.findById(scope, id);
		if (article) {
			articles = articles.filter(x => x !== article);
		}
		return article;
	}

	findById(scope: ScopeWorkspace, id: number) {
		return getArticlesFromScope(scope).find(x => x.id === id);
	}

	assertById(scope: ScopeWorkspace, id: number) {
		const article = this.findById(scope, id);
		if (!article) {
			throw NotFoundError.entity('article', {id});
		}
		return article;
	}
}
