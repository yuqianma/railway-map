const fs = require('fs');
const path = require('path');
const Crawler = require('crawler');

const LOC_DOC_PATH = path.join(__dirname, './locations.json');

const LocDoc = JSON.parse(fs.readFileSync(LOC_DOC_PATH));

// uri: `https://restapi.amap.com/v3/geocode/geo?key=${process.env.AMAP_KEY}&address=${encodeURIComponent(name)}`,
const getApiUrl = (queryName) => `https://restapi.amap.com/v3/place/text?key=${process.env.AMAP_KEY}&keywords=${encodeURIComponent(queryName)}&types=${encodeURIComponent("火车站")}`;

function fetchNamesLocation(names) {
	if (!process.env.AMAP_KEY) {
		throw 'cannot find amap key, set `AMAP_KEY` in `env.config.local.js` or env';
	}

	return new Promise((res, rej) => {

		const nameLocationMap = {};

		if (names.length === 0) {
			res(nameLocationMap);
			return;
		}

		const c = new Crawler({
			rateLimit: 60,
			jQuery: false,
			json: true,
			callback: (error, response, done) => {
				const name = response.options.locationName;

				if (error || (response.statusCode / 100 | 0) !== 2) {
					console.error('[error]', name, error || response.body);
				} else {
					const result = response.body;
					const geocode = result.pois[0];
					if (geocode) {
						let { pname: province, cityname: city, location } = geocode;

						city = city.length ? city : null;
						const loc = location.split(',');
						location = [+loc[0], +loc[1]];

						nameLocationMap[name] = {
							province, city, location
						}

						console.log(name, province, location);
					} else {
						if (response.options.fallback) {
							nameLocationMap[name] = {
								invalid: true,
								location: []
							}
							console.log(name, 'invalid!!!!!!');
						} else {
							// try second time with "~站"
							c.queue({
								uri: getApiUrl(name),
								locationName: name,
								fallback: true,
							});
						}
					}
				}

				done();
			}
		});

		c.on('drain', () => {
			res(nameLocationMap);
		});

		names.forEach(name => {
			const queryName = name.replace(/站$/, '');
			c.queue({
				uri: getApiUrl(queryName),
				locationName: name,
			});
		});

	});
}

async function recordNamesLocation(unresolvedNames) {
	if (unresolvedNames.length) {
		console.log(unresolvedNames.length, 'names to fetch');

		const nameLocationMap = await fetchNamesLocation(unresolvedNames);
		Object.assign(LocDoc, nameLocationMap);

		const formatJson = JSON.stringify(LocDoc, null, 2);
		// console.log(LocDoc);
		fs.writeFileSync(LOC_DOC_PATH, formatJson);
		console.log(`${LOC_DOC_PATH} updated`);
	} else {
		console.log('all names are resolved');
	}
}

const nameList = JSON.parse(fs.readFileSync(path.join(__dirname, './station_names.json'), 'utf8'));

let unresolvedNames = nameList.map(name => `${name}站`).filter(name => !LocDoc[name] || LocDoc[name].invalid);

// console.log(unresolvedNames);

recordNamesLocation(unresolvedNames);
