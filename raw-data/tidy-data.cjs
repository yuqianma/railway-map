const fs = require('fs');
const path = require('path');

const DATA_FOLDER = `trains_20220731_SHH`;

const trainsData = {};

const stationNameSet = new Set();

const trips = [];

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
			return trainData.every(t => t.arrive_day_str === "当日到达");
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
		const trip = {};
		trip.trainNo = trainNo;
		trip.waypoints = trainData.map(t => {
			const coords = locations[`${t.station_name}站`].location;
			const timestamp = new Date(`2022-07-31 ${t.arrive_time}`).getTime();

			return {
				coords,
				timestamp,
			};
		});
		trips.push(trip);
	});

	fs.writeFileSync(path.join(__dirname, "./trips.json"), JSON.stringify(trips));

}

main();
