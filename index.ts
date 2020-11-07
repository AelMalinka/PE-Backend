import Debug from 'debug';
import Server from './server'

const port = 3000;
const debug = Debug('Application');
const server = new Server();

server.listen(port, () => {
	debug(`listening on ${port}`);
});
