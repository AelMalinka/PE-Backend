import Debug from 'debug';
import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as logger from 'koa-logger';
import * as bodyParser from 'koa-bodyparser';

import * as http from 'http';

import { station, weather } from './weather';

const debug = Debug('Server');

// 2020-11-07 AMR NOTE: only defining required pieces for now
export interface Request {
	address: {
		latitude: number;
		longitude: number;
	};
	description: {
		event_opened: string;
	};
	fire_department: {
		timezone?: string;
	};
}

export default class Server extends Koa {
	#router: Router;
	#server: http.Server | null;

	constructor() {
		super();

		this.#server = null;
		this.#router = new Router();

		this.#router.post('/', async (ctx, next) => {
			await next();

			const data: Request = ctx.request.body;
			const { latitude, longitude } = data.address;
			const { event_opened } = data.description;
			debug(`requesting weather at ${latitude} N ${longitude} W at ${event_opened}`);

			ctx.body = await weather(
				(await station(latitude, longitude)).id,
				event_opened,
				data.fire_department.timezone
			);
		});

		this.use(logger());
		this.use(bodyParser());

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
