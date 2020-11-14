import { split, filterHour, station, weather } from './weather';
import { expect } from 'chai';

describe('Weather', function() {
	const lat = 37.466513;
	const lon = -77.428683;
	const opened = '2017-05-15T20:32:38-04:00';
	const tz = 'US/Eastern';

	beforeEach(function() {
		this.timeout(10000);
	});

	describe('#split', function() {
		it('should get date, time and tz', function() {
			const { date, time, tz } = split(opened);

			expect(date).to.equal('2017-05-15');
			expect(time).to.equal('20:32:38');
			expect(tz).to.equal('-04:00');
		});
	});

	describe('#filterHour', function() {
		it('should filter', function() {
			const vals = [
				'2017-05-15 00:12:14',
				'2017-05-15 00:55:12',
				'2017-05-15 01:00:00',
				'2017-05-15 02:23:45',
			];

			const values = vals.map(x => { return { time: x, time_local: x }});

			expect(values.filter(filterHour('2017-05-15T00:43:00'))).to.have.lengthOf(3);
			expect(values.filter(filterHour('2017-05-15T02:43:00'))).to.have.lengthOf(1);
		});
	});

	describe('#station', function() {
		it('should find a station nearby richmond, va', async function() {
			const res = await station(lat, lon);

			expect(res.active).to.be.true;
			expect(res.id).to.not.be.null;
		});
	});

	describe('#weather', function() {

		it('should find weather in richmond with tz', async function() {
			const stat = await station(lat, lon);
			const res = await weather(stat.id, opened, tz);

			expect(res).to.have.lengthOf(2);
			expect(res[0].time_local).to.equal('2017-05-15 20:00:00');
			expect(res[1].time_local).to.equal('2017-05-15 21:00:00');
		});

		it('should find weather in richmond with guessed tz', async function() {
			const stat = await station(lat, lon);
			const res = await weather(stat.id, opened);

			expect(res).to.have.lengthOf(2);
			expect(res[0].time_local).to.equal('2017-05-15 20:00:00');
			expect(res[1].time_local).to.equal('2017-05-15 21:00:00');
		});

		it('should find weather in richmond with no tz', async function() {
			const stat = await station(lat, lon);
			const res = await weather(stat.id, opened.slice(0, -6));

			expect(res).to.have.lengthOf(2);
			expect(res[0].time).to.equal('2017-05-15 20:00:00');
			expect(res[1].time).to.equal('2017-05-15 21:00:00');
		});
	});
});
