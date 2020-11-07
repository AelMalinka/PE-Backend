import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as logger from 'koa-logger';
import * as http from 'http';

export default class Server extends Koa {
	#router: Router;
	#server: http.Server | null;

	constructor() {
		super();

		this.#server = null;
		this.#router = new Router();

		this.#router.get('/', async (ctx, next) => {
			ctx.body = { res: 'Hello!' };
			await next();
		});

		this.use(logger());
		this.use(this.#router.routes());
		this.use(this.#router.allowedMethods());
	}

	// 2020-11-06 AMR TODO: unable to forward to super listen when specifying types
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	listen(port, cb?): http.Server {
		return this.#server = super.listen(port, cb);
	}

	close(): void {
		this.#server?.close();
	}
}
