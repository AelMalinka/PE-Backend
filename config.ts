import * as dotenv from 'dotenv';

dotenv.config();

const config: {
	api: {
		key: string,
		url: string
	},
	port: string,
} = {
	api: {
		key: process.env.API_KEY || '',
		url: process.env.API_URL || 'https://api.meteostat.net/v2',
	},
	port: process.env.PORT || '3000',
};

export default config;
