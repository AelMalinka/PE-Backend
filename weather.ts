import Debug from 'debug';
import config from './config';
import * as https from 'https';

const debug = Debug('Weather');

export interface Station {
	id: string;
	name: {
		en: string;
	};
	active: boolean;
	distance: number;
};

export interface Weather {
	time: string;
	time_local?: string;
	temp: number;
	dwpt: number;
	rhum: number;
	prcp: number;
	snow: number;
	wdir: number;
	wspd: number;
	wpgt: number;
	pres: number;
	tsun: number;
	coco: number;
};

const get = async (path: string): Promise<Object> => {
	return new Promise((resolve, reject) => {
		https.get(`${config.api.url}/${path}`, {
			headers: {
				'x-api-key': config.api.key,
			},
		}, (res) => {
			let body = '';

			res.on('data', (chunk: Buffer | string) => {
				body += chunk.toString();
			}).on('end', () => {
				resolve(JSON.parse(body));
			}).on('error', (err) => {
				reject(err);
			});
		});
	});
};

// 2020-11-07 AMR FIXME: chokes on wrong sep w/ cryptic error
export const split = (dtime: string, sep: string = 'T'): { date: string, time: string, tz: string } => {
	return {
		date: dtime.split(sep)[0],
		time: dtime.split(sep)[1].split('-')[0],
		tz: dtime.slice(19),
	}
};

// 2020-11-07 AMR FIXME: formatting assumptions and cryptix errors
export const filterHour = (dtime: string) => {
	const hour = +split(dtime).time.split(':')[0];
	return (a: {time: string, time_local?: string}) => {
		const h = +split(a.time_local || a.time, ' ').time.split(':')[0];
		return h >= hour && h <= hour + 1;
	};
};

export const station = async (lat: number, lon: number): Promise<Station> => {
	const res = await get(`stations/nearby?lat=${lat}&lon=${lon}&limit=1`);
	const ret: Station = res['data'][0];

	debug(`found station ${ret.name.en} (${ret.id})`);

	return ret;
};

export const weather = async (station: string, dtime: string): Promise<Weather[]> => {
	const { date, time, tz } = split(dtime);
	const res = await get(`stations/hourly?station=${station}&start=${date}&end=${date}&model=1&tz=${tz}`);
	const ret: Weather[] = res['data'].filter(filterHour(dtime));

	debug(`found weather at ${ret[0].time_local || ret[0].time} and ${ret[1].time_local || ret[1].time}`);

	return ret;
};
