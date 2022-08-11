# 今天吃什么
每天都会被吃什么所困扰，让程序来帮你吧。
搜索你的地点，选择后在你附近的餐饮中随机选取一个。
# 更换accessKey
由于单个api每日可用次数有限，所以建议去高德开发者（https://console.amap.com/dev/index）注册并生成自己的accessKey，然后去APP.vue文件里替换`AMAP_AK`常量为你自己的`accessKey`
# 用法
```
npm install
npm run serve
```