const fs = require('fs');
const path = require('path');

const DATA_FOLDER = `trains_20220731_SHH`;

const trainsData = {};

const stationNameSet = new Set();

const routes = [];

const TimeRange = [Infinity, -Infinity];

const locations = JSON.parse(fs.readFileSync(path.join(__dirname, "./locations.json")));

async function main() {
	const fetchedTrainJSONFiles = fs.readdirSync(path.join(__dirname, DATA_FOLDER))
		.filter(filename => filename.endsWith(".json"));

	const fileData = await Promise.all(fetchedTrainJSONFiles.map(filename => {
		return fs.promises.readFile(path.join(__dirname, `./${DATA_FOLDER}/${filename}`)).then(data => {
			const json = JSON.parse(data);
			json.train_no = filename.replace(".json", ""); // add train_no to json
			return json;
		});
	}));

	console.log(fileData.length);

	fileData.forEach(f => {
		const trainData = f.data.data;
		if (!trainData || trainData.length === 0) {
			console.error("no train data for", trainNo);
			return;
		}
		trainsData[f.train_no] = trainData;
	});

	console.log(Object.entries(trainsData).length);
	// console.log(Object.entries(trainsData)[0]);

	const validData = Object.entries(trainsData)
		.filter(([trainNo, trainData]) => {
			if (trainData.every(t => t.arrive_day_str === "当日到达")) {
				return true;
			}
			// console.log("非当日", trainNo, new Set(trainData.map(t => t.arrive_day_str)));
		});

	// Step1: get station-coordinates map
	validData.forEach(([trainNo, trainData]) => {
		trainData.forEach(t => {
			stationNameSet.add(t.station_name);
		});
	});

	console.log(stationNameSet.size);
	// fs.writeFileSync("station_names.json", JSON.stringify([...stationNameSet]));
	
	// Step2: output trips
	validData.forEach(([trainNo, trainData]) => {
		const route = {};
		route.trainNo = trainNo;
		route.trainCode = trainData[0].station_train_code;
		route.waypoints = [];

		function appendWaypoint(station, timestamp) {
			route.waypoints.push({ station, timestamp });
			if (isNaN(timestamp)) {
				console.log(trainNo, timestamp);
				throw new Error("timestamp is NaN");
			}

			TimeRange[0] = Math.min(TimeRange[0], timestamp);
			TimeRange[1] = Math.max(TimeRange[1], timestamp);
		}

		trainData.forEach(t => {
			// const coords = locations[`${t.station_name}站`].location;
			const DATE_STRING = "2022-07-31";
			// arrive - stop - start(depart)
			const arriveTime = new Date(`${DATE_STRING} ${t.arrive_time}`).getTime();
			const startTime = new Date(`${DATE_STRING} ${t.start_time}`).getTime();

			// first station has no arrive time
			if (!t.is_start) {
				appendWaypoint(t.station_name, arriveTime);
			}

			appendWaypoint(t.station_name, startTime);
		});
		routes.push(route);
	});

	console.log(TimeRange);

	fs.writeFileSync(path.join(__dirname, "./routes.json"), JSON.stringify(routes));

}

main();
