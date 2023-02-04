import fs from "fs";
import path from "path";
import * as url from "url";
import { TIMETABLES_FOLDER_NAME, STATION_NAMES_FILE } from "./constants.mjs";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const TIMETABLES_FOLDER_PATH = path.join(__dirname, TIMETABLES_FOLDER_NAME);

const stationNameSet = new Set();

/* file example:
{
	...
	"data": {
		"data": [
			{
				"arrive_day_str": "当日到达",
				"station_name": "大连",
				"train_class_name": "普快",
				"is_start": "Y",
				"service_type": "1",
				"end_station_name": "加格达奇",
				"arrive_time": "----",
				"start_station_name": "大连",
				"station_train_code": "2061",
				"arrive_day_diff": "0",
				"start_time": "13:44",
				"station_no": "01",
				"wz_num": "--",
				"running_time": "00:00"
			},
			{
				"arrive_day_str": "次日到达",
				"arrive_time": "13:43",
				"station_train_code": "2061",
				"station_name": "加格达奇",
				"arrive_day_diff": "1",
				"OT": [],
				"start_time": "13:43",
				"wz_num": "--",
				"station_no": "30",
				"running_time": "23:59"
			}
		]
	},
	...
}

*/

fs.readdirSync(TIMETABLES_FOLDER_PATH)
	.filter(filename => filename.endsWith(".json"))
	.forEach((filename) => {
		const route = JSON.parse(fs.readFileSync(path.join(TIMETABLES_FOLDER_PATH, filename)));
		const timetable = route.data.data;
		if (!timetable) {
			console.log(route);
			throw new Error(filename);
		}
		const routeStationNames = timetable.map(s => s.station_name);
		routeStationNames.forEach((name) => {
			if (name=="永春") {
				console.log(timetable[0].station_train_code);
			}
			stationNameSet.add(name);
		});
	});

// const stationNamesFilePath = path.join(__dirname, STATION_NAMES_FILE);
// fs.writeFileSync(stationNamesFilePath, JSON.stringify([...stationNameSet]));

// console.log(stationNameSet.size, "station names");
