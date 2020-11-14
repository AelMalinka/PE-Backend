import Server, { Request } from './server';
import config from './config';
import { expect } from 'chai';
import * as http from 'http';


describe('Server', function() {
	interface Response {
		res?: string;
	}

	let server: Server | null = null;
	const lat = 37.541885;
	const lon = -77.440624;
	const opened = '2017-05-15T13:19:12-04:00';
	const tz = 'US/Eastern';

	beforeEach(function() {
		this.timeout(10000);
		server = new Server();
	});
	afterEach(function() {
		server?.close();
	});

	async function put(page: string, req: Request): Promise<Response> {
		return new Promise((resolve, reject) => {
			const request = http.request(`http://localhost:${config.test_port}${page}`, {
				headers: {
					'content-type': 'application/json',
				},
				method: 'POST',
			}, (res) => {
				let body = '';

				res.on('data', (chunk) => {
					body += chunk.toString();
				}).on('end', () => {
					if(res.headers['content-type']?.startsWith('application/json'))
						resolve(JSON.parse(body));
					else
						reject('invalid res type');
				}).on('error', (err) => {
					reject(err);
				});
			});

			request.on('error', (err) => {
				reject(err);
			}).end(JSON.stringify(req));
		});
	}

	async function listen(server: Server | null): Promise<void> {
		return new Promise((resolve) => {
			server?.listen(config.test_port, () => {
				resolve();
			});
		});
	}

	describe('#listen', function() {
		it('should call callback on success', async function() {
			return listen(server);
		});
	});

	describe('Routes', function() {
		it('should respond respond to GET on /', async function() {
			await listen(server);
			const res = await put('/', {
				address: {
					latitude: lat,
					longitude: lon,
				},
				description: {
					event_opened: opened,
				},
				fire_department: {
					timezone: tz,
				},
			});

			expect(res.res).to.not.be.null;
		});
	});
});
