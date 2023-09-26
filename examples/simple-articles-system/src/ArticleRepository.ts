let articleId = 1;
let articles: Article[] = [{
	id: articleId++,
	title: 'Article 1',
	content: 'Article 1 content',
	isPublished: false
}, {
	id: articleId++,
	title: 'Article 2',
	content: 'Article 2 content',
	isPublished: true
}];

export interface Article {
	id: number;
	title: string;
	content: string;
	isPublished: boolean;
}

export namespace Article {
	export type Input = Omit<Article, 'id' | 'isPublished'>;
}

export interface ArticleQuery {
	onlyPublished: boolean;
}

export class ArticleRepository {
	findAll({onlyPublished}: ArticleQuery) {
		if (onlyPublished) {
			return articles.filter(x => x.isPublished);
		}
		return articles;
	}

	create(input: Article.Input) {
		const newArticle = {
			id: articleId++,
			...input,
			isPublished: false
		};
		articles.push(newArticle);
		return newArticle;
	}

	update(id: number, input: Article.Input) {
		const article = this.findById(id);
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

	publish(id: number) {
		const article = this.findById(id);
		if (article) {
			article.isPublished = true;
		}
		return article;
	}

	delete(id: number) {
		const article = this.findById(id);
		if (article) {
			articles = articles.filter(x => x !== article);
		}
		return article;
	}

	findById(id: number) {
		return articles.find(x => x.id === id);
	}
}
