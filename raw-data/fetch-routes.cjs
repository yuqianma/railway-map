const fs = require("fs");
const path = require("path");
const Crawler = require("crawler");

// https://search.12306.cn/search/v1/train/search?date=20221012&keyword=G

const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36";

const FORMATTED_DATE = new Date(new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai"}).format(new Date()));

const YEAR = FORMATTED_DATE.getFullYear();
const MONTH = (FORMATTED_DATE.getMonth() + 1 + "").padStart(2, 0);
const DATE = FORMATTED_DATE.getDate();

const DATE_STRING = `${YEAR}${MONTH}${DATE}`;

const FILE_NAME = `routes_${DATE_STRING}.json`;

const getURL = keyword => `https://search.12306.cn/search/v1/train/search?date=${DATE_STRING}&keyword=${keyword}`;

const LIMIT_PER_FETCH = 200;

const PREFIX = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");

const routes = {};

const crawler = new Crawler({
	maxConnections: 1,
	jQuery: false,
	callback: function (error, res, done) {
		if (error) {
			console.log(error);
		} else {
			handleFetchingResult(res);
		}
		done();
	}
});

crawler.on("drain",function(){
	console.log("finished");
	const data = JSON.stringify(routes);
	fs.writeFileSync(path.join(__dirname, FILE_NAME), data);
});

PREFIX.forEach(keyword => {
	const url = getURL(keyword);
	console.log(url);
	crawler.queue({
    uri: url,
		userAgent: USER_AGENT,
		level: 0,
		keyword,
	});
});

function appendRoutes(keyword, data) {
	const head = keyword[0];
	if (!routes[head]) {
		routes[head] = [];
	}
	const routesByHead = routes[head];
	const routesToAdd = data.filter(route => !routesByHead.find(r => r.station_train_code === route.station_train_code));
	routesByHead.push(...routesToAdd);
	console.log(keyword, data.length, `added`, routesToAdd.length, `queue left:`, crawler.queueSize);
}

function handleFetchingResult(res) {
	let data;
	try {
		data = JSON.parse(res.body).data;
	} catch (e) {
		console.log(e);
		// if (!res.options.uri) {
		// 	throw new Error("no uri");
		// }
		crawler.queue({
			...res.options
		});
		return;
	}
	

	if (!data) {
		console.log("no data", res.options.keyword, res.body);
		return;
	}

	const { keyword } = res.options;

	if (data.length === 0) {
		console.log("no data for", res.options.keyword);
	} else if (data.length < LIMIT_PER_FETCH) {
		appendRoutes(keyword, data);
	} else {
		appendRoutes(keyword, data);
		const lastResult = data[data.length - 1];
		queuePartialRoutesFetchingByPrefix(keyword, lastResult);
	}
}

// more than 200 results
function queuePartialRoutesFetchingByPrefix(prefix, lastResult) {
	const { station_train_code } = lastResult;
	const suffix = station_train_code.slice(prefix.length);
	const suffixHead = suffix[0];
	for (let i = suffixHead; i < 9; ++i) {
		const keyword = prefix + i;
		const url = getURL(keyword);
		console.log(url);
		crawler.queue({
			uri: url,
			userAgent: USER_AGENT,
			level: 0,
			keyword,
		});
	}
}
