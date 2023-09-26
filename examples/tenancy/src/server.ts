import * as express from 'express';
import wrapAsync = require('express-async-handler');
import {AccessDeniedError, BasicPrincipal} from '@pallad/access-control';
import {ArticleRepository} from "./ArticleRepository";
import * as boom from '@hapi/boom';
import {Principal} from "./AccessQuery";
import {ArticleService} from "./ArticleService";
import {accessControl} from "./AccessControl";
import {ACLHelper} from "./ACLHelper";
import {UserService} from "./UserService";
import {AuthenticationError, AuthorizationError, NotFoundError} from "@pallad/common-errors";

const app = express();
const port = 3000

const articleService = new ArticleService(
	accessControl,
	new ACLHelper(),
	new ArticleRepository()
);

const userService = new UserService();

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
	if (req.headers.authorization === 'itsme' && req.headers['x-user-id'] && req.headers['x-impersonator-username']) {
		return new Principal.ImpersonatedUser(
			req.headers['x-impersonator-username'] as string,
			userService.authenticateById(parseInt(req.headers['x-user-id'] as string, 10))
		);
	} else if (req.headers.authorization === 'itsme' && req.headers['x-user-id']) {
		return userService.authenticateById(parseInt(req.headers['x-user-id'] as string, 10));
	}
	return BasicPrincipal.Anonymous.INSTANCE;
}

app.use(express.json());
app.get('/articles',
	wrapAsync(async (req, res) => {
		res.json(
			await articleService.findAll(getPrincipalFromRequest(req))
		);
	})
);

app.post('/articles',
	wrapAsync(async (req, res) => {
		res.json(
			await articleService.create(getPrincipalFromRequest(req), {
				title: req.body.title,
				content: req.body.content
			})
		);
	})
);

app.post(
	'/articles/:id/publish',
	wrapAsync(async (req, res) => {
		res.json(
			await articleService.publish(
				getPrincipalFromRequest(req),
				getArticleIdFromRequest(req),
			)
		)
	})
);

app.delete('/articles/:id',
	wrapAsync(async (req, res) => {
		const article = await articleService.delete(getPrincipalFromRequest(req), getArticleIdFromRequest(req));
		if (!article) {
			throw boom.notFound();
		}
		res.status(200);
	})
);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
	if (err instanceof AccessDeniedError || err instanceof AuthorizationError) {
		next(boom.forbidden());
	} else if (err instanceof AuthenticationError) {
		next(boom.unauthorized());
	} else if (err instanceof NotFoundError) {
		next(boom.notFound(err.message, err.references));
	} else {
		next(err);
	}
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
	if (boom.isBoom(err)) {
		res.status(err.output.statusCode);
		for (const [header, value] of Object.entries(err.output.headers)) {
			if (value !== undefined) {
				res.header(header, value as string);
			}
		}
		res.json(err.output.payload);
	} else {
		res.status(500).json({error: 'Internal server error'});
	}
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
});
