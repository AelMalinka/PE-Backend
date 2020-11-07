import Debug from 'debug';
import Server from './server'
import config from './config';

const debug = Debug('Application');
const server = new Server();

server.listen(config.port, () => {
	debug(`listening on ${config.port}`);
});
