# Links List

12306 时刻表查询页面：https://kyfw.12306.cn/otn/queryTrainInfo/init

某日期车次输入提示 API：https://search.12306.cn/search/v1/train/search?keyword=G&date=20220731

`keyword={}`，看上去一次返回最多 200 条。可以通过分次获取，取得所有车次，及更重要的车次 `train_no` 信息。

某日期某车次时刻表 API：https://kyfw.12306.cn/otn/queryTrainInfo/query?leftTicketDTO.train_no=24000000G100&leftTicketDTO.train_date=2022-07-31&rand_code=

从输入提示 API 取得车次，填入 `train_no={}`，获得车次时刻表

所有车站名 jsonp: https://kyfw.12306.cn/otn/resources/js/framework/station_name.js?station_version=1.9236

某日某车站所有车次数据：https://www.12306.cn/kfzmpt/czxx/query?train_start_date=2022-07-31&train_station_code=SHH

`SHH` 从所有车站名文件中拿到，车站电报码。

----

12306进行过多次改版，有些流传的数据接口已经过时，如 `https://kyfw.12306.cn/otn/resources/js/query/train_list.js` 一直在 2019 年。

需要一些典型数据确认数据新旧。

验证数据：

奉节 2022-06-20 才开通火车（高铁）。2022-07-31 当天开行的列车有 `C6404, G1324, G3454, D1882` 等。

----

其他备用信息：

12306 手机页面：https://mobile.12306.cn/weixin/wxcore/init

OSM 列车信息：https://www.openrailwaymap.org/

12306 APP 里可以用车次、车站、站站查时刻表。或可抓 API。但是查出来的是全部，有些当日不发车的。
