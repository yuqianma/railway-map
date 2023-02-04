# Steps

1. `fetch-routes.mjs` 获取当日所有车次、列车编号
2. `fetch-routes-timetables.mjs` 更新列车编号时刻表到`routes-timetables`文件夹
3. `collect-station-names.mjs`更新车站名列表`station_names.json`
4. `resolve-locations.mjs`更新车站经纬度 Map `locations.json`

# 调用的 API

12306 时刻表查询页面：https://kyfw.12306.cn/otn/queryTrainInfo/init

某日期车次输入提示 API：https://search.12306.cn/search/v1/train/search?keyword=G&date=20220731

`keyword={}`，看上去一次返回最多 200 条。可以通过分次获取，取得所有车次，及更重要的**列车编号 `train_no` 信息**。

某日期某列车编号**时刻表** API：https://kyfw.12306.cn/otn/queryTrainInfo/query?leftTicketDTO.train_no=24000000G100&leftTicketDTO.train_date=2022-07-31&rand_code=

即
1. 从输入提示 API 取得车次与列车编号
2. 取得列车编号 `train_no={}`
3. 获得列车时刻表（时刻表非实时状态，与日期无关）

# 验证数据

需要一些典型数据验证数据新旧、API结果、观察特殊情况。

## 验证例子

`白银南`站2022年12月29日投用，`D3585/D3584, D8889/D8892`

`永春`站2022年12月30日投用，在福建省泉州市，非台北市捷运站。`C879, C880, K8756/K8757, T8010`

`富阳`站在浙江，非安徽`阜阳`站。地理位置 API 可因此验证。

改名：`乃托`站，原名越西站，位于四川省凉山彝族自治州越西县乃托镇。`越西`站，位于中国四川省凉山彝族自治州越西县境内。

## 典型数据

次日到达：https://kyfw.12306.cn/otn/queryTrainInfo/query?leftTicketDTO.train_no=0400000Z8403&leftTicketDTO.train_date=2023-01-25&rand_code=

（修改日期为当日）


# 其他备用信息

12306进行过多次改版，有些流传的数据接口已经过时，如 `https://kyfw.12306.cn/otn/resources/js/query/train_list.js` 一直在 2019 年。

所有车站名 jsonp （在时刻表查询页面中）: https://kyfw.12306.cn/otn/resources/js/framework/station_name.js?station_version=1.9253

某日某车站所有车次数据：https://www.12306.cn/kfzmpt/czxx/query?train_start_date=2022-07-31&train_station_code=SHH

`SHH` 从所有车站名文件中拿到，车站电报码。

12306 手机页面：https://mobile.12306.cn/weixin/wxcore/init

OSM 列车信息：https://www.openrailwaymap.org/

12306 APP 里可以用车次、车站、站站查时刻表。或可抓 API。但是查出来的是全部，有些当日不发车的。
