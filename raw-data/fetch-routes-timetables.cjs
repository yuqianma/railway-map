const fs = require('fs');
const path = require('path');
const Crawler = require("crawler");

const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36";

const TIMETABLES_FOLDER = "routes-timetables";
const TIMETABLES_FOLDER_PATH = path.join(__dirname, TIMETABLES_FOLDER);

const routesOnDateFile = process.argv[2];

if (!routesOnDateFile) {
	console.log("Usage: node fetch-routes-timetables.js <routes_date.json>");
	process.exit(1);
}

/** file format:
{
	"1": [{..., train_no: "xxxxx"}, {..., train_no: "xxxxx"}, ...],
	"G": [{..., train_no: "xxxxx"}, {..., train_no: "xxxxx"}, ...],
}
*/

const dateString = routesOnDateFile.replace("routes_", "").replace(".json", "");
const year = dateString.slice(0, 4);
const month = dateString.slice(4, 6);
const date = dateString.slice(6, 8);

const routesOnDate = JSON.parse(fs.readFileSync(routesOnDateFile));

const routeSet = new Set(Object.values(routesOnDate).flat().map(route => route.train_no));
console.log("total:", routeSet.size);

const fetchedRouteNos = fs.readdirSync(TIMETABLES_FOLDER_PATH)
	.filter(filename => filename.endsWith(".json"))
	.map(filename => filename.replace(".json", ""));
const fetchedRouteSet = new Set(fetchedRouteNos);
console.log("fetched:", fetchedRouteSet.size);

const toFetchRouteNos = [...routeSet].filter(routeNo => !fetchedRouteSet.has(routeNo));

console.log("to fetch:", toFetchRouteNos.length);

const startTime = Date.now();

const c = new Crawler({
	maxConnections: 2,
	jQuery: false,
	callback: function (error, res, done) {
		if (error) {
			console.log(error);
		} else {
			const filepath = path.join(TIMETABLES_FOLDER_PATH, res.options.filename);
			fs.createWriteStream(filepath).write(res.body);
		}
		// time left
		const timeLeft = (Date.now() - startTime) / 1000 / (toFetchRouteNos.length - c.queueSize) * c.queueSize | 0;
		console.log(`time left: ${timeLeft}s`, `queue size: ${c.queueSize}`);
		done();
	}
});

// [...toFetchRouteNos].forEach(trainNo => {
// 	const url = `https://kyfw.12306.cn/otn/queryTrainInfo/query?leftTicketDTO.train_no=${trainNo}&leftTicketDTO.train_date=${year}-${month}-${date}&rand_code=`;
// 	// console.log(url);
// 	c.queue({
//     uri: url,
//     filename: `${trainNo}.json`,
// 		userAgent: USER_AGENT
// 	});
// });

