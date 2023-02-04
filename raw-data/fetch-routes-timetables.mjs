import fs from "fs";
import path from "path";
import * as url from "url";
import Crawler from "crawler";
import { USER_AGENT, TIMETABLES_FOLDER_NAME } from "./constants.mjs";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const TIMETABLES_FOLDER_PATH = path.join(__dirname, TIMETABLES_FOLDER_NAME);

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
			console.error("error:", res.options.trainNo);
			console.error(error);
			done();
			return;
		}

		let json = {};
		try {
			json = JSON.parse(res.body);
		} catch (e) {
			console.error(`${res.options.trainNo} json parse error`);
			done();
			return;
		}

		if (!json.data.data) {
			console.error(`${res.options.trainNo} data null, re-queue`);
			queueTrainNo(res.options.trainNo);
			done();
			return;
		}

		const filepath = path.join(TIMETABLES_FOLDER_PATH, res.options.filename);
		fs.createWriteStream(filepath).write(res.body);
		// time left
		const timeLeft = (Date.now() - startTime) / 1000 / (toFetchRouteNos.length - c.queueSize) * c.queueSize | 0;
		console.log(`time left: ${timeLeft}s`, `queue size: ${c.queueSize}`);
		done();
	}
});

function queueTrainNo(trainNo) {
	const url = `https://kyfw.12306.cn/otn/queryTrainInfo/query?leftTicketDTO.train_no=${trainNo}&leftTicketDTO.train_date=${year}-${month}-${date}&rand_code=`;
	// console.log(url);
	c.queue({
    uri: url,
		trainNo,
    filename: `${trainNo}.json`,
		userAgent: USER_AGENT
	});
}

[...toFetchRouteNos].forEach(queueTrainNo);
