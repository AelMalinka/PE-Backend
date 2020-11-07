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
}

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
}

export interface FilterFunction extends Function {
	(a: {time: string, time_local?: string}): boolean;
}

const get = async (path: string): Promise<Record<string, unknown>> => {
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

export const split = (dtime: string, sep = 'T'): { date: string, time: string, tz?: string } => {
	return {
		date: dtime.split(sep)[0],
		time: dtime.split(sep)[1].slice(0, 8),
		tz: dtime.split(sep)[1].length > 8 ? dtime.slice(-6) : undefined,
	}
};

export const filterHour = (dtime: string): FilterFunction => {
	const hour = +split(dtime).time.split(':')[0];
	return (a: {time: string, time_local?: string}) => {
		const h = +split(a.time_local || a.time, ' ').time.split(':')[0];
		return h >= hour && h <= hour + 1;
	};
};

export const station = async (lat: number, lon: number): Promise<Station> => {
	const res = await get(`stations/nearby?lat=${lat}&lon=${lon}&limit=1`);
	const ret: Station = (res['data'] as Station[])[0];

	debug(`found station ${ret.name.en} (${ret.id})`);

	return ret;
};

export const weather = async (station: string, dtime: string, rtz?: string): Promise<Weather[]> => {
	const { date, tz } = split(dtime);
	const tzstring = (tz?: string): string => {
		if(tz)
			return `&tz=${tz}`;
		else
			return '';
	};

	const res = await get(`stations/hourly?station=${station}&start=${date}&end=${date}&model=1${tzstring(rtz || tz)}`);
	const ret: Weather[] = (res['data'] as Weather[]).filter(filterHour(dtime));

	debug(`found weather at ${ret[0].time_local || ret[0].time} and ${ret[1].time_local || ret[1].time}`);

	return ret;
};
