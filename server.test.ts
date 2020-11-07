import Server from './server';
import config from './config';
import { expect } from 'chai';
import * as http from 'http';


describe('Server', function() {
	interface Response {
		res?: string;
	}

	let server: Server | null = null;

	beforeEach(function() {
		server = new Server();
	});
	afterEach(function() {
		server?.close();
	});

	async function get(page: string): Promise<Response> {
		return new Promise((resolve, reject) => {
			http.get(`http://localhost:${config.test_port}${page}`, (res) => {
				let body = '';
				res.on('data', (chunk: Buffer | string) => {
					body += chunk.toString();
				}).on('end', () => {
					if(res.headers['content-type']?.startsWith('application/json'))
						resolve(JSON.parse(body));
					else
						reject('invalid res type');
				}).on('error', (e) => {
					reject(e);
				});
			});
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
			const res = await get('/');
			expect(res.res).to.not.be.null;
			expect(res.res).to.equal('Hello!');
		});
	});
});
