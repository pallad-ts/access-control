import {AccessControl} from "@pallad/access-control";
import {Article, ArticleRepository} from "./ArticleRepository";
import {OurAccessControl} from "./accessControl";
import {Principal} from "./AccessQueryElements";

export class ArticleService {
	constructor(private accessControl: OurAccessControl, private articleRepository: ArticleRepository) {
	}

	async findAll(principal: Principal) {
		await this.accessControl.assertIsAllowed({
			action: 'read',
			subject: 'article',
			principal
		});

		const canReadDraft = await this.accessControl.isAllowed({
			action: 'read-draft',
			subject: 'article',
			principal
		})

		return this.articleRepository.findAll({
			onlyPublished: !canReadDraft
		})
	}

	async create(principal: Principal, input: Article.Input) {
		await this.accessControl.assertIsAllowed({
			action: 'create',
			principal,
			subject: 'article'
		});

		return this.articleRepository.create(input);
	}

	async update(principal: Principal, input: Article.Input) {
		await this.accessControl.assertIsAllowed({
			action: 'create',
			principal,
			subject: 'article'
		});

		return this.articleRepository.create(input);
	}

	async delete(principal: Principal, id: number) {
		await this.accessControl.assertIsAllowed({
			action: 'delete',
			principal,
			subject: 'article'
		});

		return this.articleRepository.delete(id);
	}

	async publish(principal: Principal, id: number) {
		await this.accessControl.assertIsAllowed({
			action: 'publish',
			principal,
			subject: 'article'
		});

		return this.articleRepository.publish(id);
	}
}
