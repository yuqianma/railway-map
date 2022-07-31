const fs = require('fs');
const path = require('path');
const Crawler = require("crawler");

const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36";

const DATA_FOLDER = `trains_20220731_SHH`;

const trainsJSON = JSON.parse(fs.readFileSync(path.join(__dirname, "./trains_20220731_SHH.json")));

const trains = trainsJSON.data.data;

const trainNos = new Set(trains.map(train => train.train_no));

console.log("to fetch:", trainNos.size);

const fetchedTrains = fs.readdirSync(path.join(__dirname, DATA_FOLDER))
	.filter(filename => filename.endsWith(".json"))
	.map(filename => filename.replace(".json", ""));

console.log("fetched:", fetchedTrains.length);
console.log(fetchedTrains);

const c = new Crawler({
	maxConnections: 1,
	jQuery: false,
	callback: function (error, res, done) {
		if (error) {
			console.log(error);
		} else {
			const filepath = path.join(__dirname, `./${DATA_FOLDER}/${res.options.filename}`);
			fs.createWriteStream(filepath).write(res.body);
		}
		console.log("queue:", c.queueSize);
		done();
	}
});

// c.queue({
// 	uri: "https://httpbin.org/anything",
// 	filename: "test.json",
// 	userAgent: USER_AGENT
// });

[...trainNos].forEach(trainNo => {
	if (fetchedTrains.includes(trainNo)) {
		return;
	}
	const url = `https://kyfw.12306.cn/otn/queryTrainInfo/query?leftTicketDTO.train_no=${trainNo}&leftTicketDTO.train_date=2022-07-31&rand_code=`;
	// console.log(url);
	c.queue({
    uri: url,
    filename: `${trainNo}.json`,
		userAgent: USER_AGENT
	});
});

