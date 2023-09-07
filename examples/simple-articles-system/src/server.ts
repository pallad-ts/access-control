import * as express from 'express';
import {accessControl} from "./accessControl";
import wrapAsync = require('express-async-handler');
import {Action, Principal, Subject} from "./AccessQueryElements";
import {AccessDeniedError, Principal as _Principal, Subject as _Subject} from '@pallad/access-control';
import {ArticleRepository} from "./ArticleRepository";
import * as boom from '@hapi/boom';

const app = express();
const port = 3000

const articleRepository = new ArticleRepository();

function getArticleIdFromRequest(req: express.Request): number {
	const candidate = parseInt(req.params.id, 10);
	if (isNaN(candidate)) {
		throw boom.badRequest();
	}

	return candidate;
}

function getPrincipalFromRequest(req: express.Request): Principal {
	// Just for tutorial purposes!
	// Obviously very insecure way to identify principal
	// Never use it in real life application
	if (req.headers.authorization === 'itsme') {
		return 'logged-in';
	}
	return _Principal.Anonymous.INSTANCE;
}

function requireAccess(action: Action, subject: Subject): express.RequestHandler {
	return (req, res, next) => {
		accessControl.assertIsAllowed({
			action,
			subject,
			principal: getPrincipalFromRequest(req)
		})
			.then(() => {
				next();
			}, next);
	}
}

app.use(express.json());
app.get('/articles',
	requireAccess('read', 'article'),
	wrapAsync(async (req, res) => {
		const canSeeDraft = await accessControl.isAllowed({
			action: 'read-draft',
			principal: getPrincipalFromRequest(req),
			subject: 'article'
		});

		res.json(
			articleRepository.findAll({
				onlyPublished: !canSeeDraft
			})
		)
	})
);

app.post('/articles',
	requireAccess('create', 'article'),
	(req, res) => {
		res.json(
			articleRepository.create({
				title: req.body.title,
				content: req.body.content
			})
		);
	}
);

app.post(
	'/articles/:id/publish',
	requireAccess('publish', 'article'),
	(req, res) => {
		res.json(
			articleRepository.publish(
				getArticleIdFromRequest(req),
			)
		)
	}
);

app.delete('/articles/:id',
	requireAccess('delete', 'article'),
	(req, res) => {
		const article = articleRepository.delete(getArticleIdFromRequest(req));
		if (!article) {
			throw boom.notFound();
		}
		res.status(200);
	}
);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
	if (err instanceof AccessDeniedError) {
		next(boom.forbidden());
	} else {
		next(err);
	}
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
});
