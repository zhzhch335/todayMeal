<template>
  <div id="app">
    <van-cell-group>
      <van-field v-model="keywords" label="地点" placeholder="输入地点搜索（最好带城市）" />
      <div v-if="posList.length" class="posContainer">
        <div @click="selectPos(item)" class="posItem" v-for="item in posList" :key="item.id">
          <div class="posName">{{item.name}}</div>
          <div class="posAddress">{{`${item.pname}${item.cityname}${item.adname}${item.address}`}}</div>
        </div>
      </div>
      <van-field disabled readonly v-model="selectedPost.name" label="已选择地点" placeholder="在上方输入关键词后选择地点" />
      <van-field v-model="radius" type="digit" label="范围（米）" placeholder="查找的半径" />
    </van-cell-group>
    <van-button @click="searchNear" type="info" block style="margin:20px 0">查找</van-button>
    <div v-if="mealList.length" class="mealContainer">
      <van-checkbox-group v-model="selectMealList">
        <van-checkbox style="margin: 5px 0" v-for="item in mealList" :key="item.id" :name="item.name">{{item.name}}</van-checkbox>
      </van-checkbox-group>
      <div v-if="hasMore" @click="moreMeal">查看更多</div>
    </div>
    <van-button v-if="selectMealList.length" @click="rollMeal" type="info" block style="margin:20px 0">今天吃啥！</van-button>
    <div v-if="result" class="resultLabel">今天要吃的是：</div>
    <div v-if="result" class="result">
      <div class="name">
        {{result}}
      </div>
      <div class="address">
        {{mealList.find(item => item.name == result).address}}
      </div>
    </div>
  </div>
</template>

<script>
const AMAP_AK = "ce431934e2a0963df9b1c665eefc8314";
import { Toast } from "vant";
import axios from "axios";
export default {
  name: 'App',
  data() {
    return {
      keywords: "", // 地点搜索关键词
      posList: [], // 地点列表
      selectedPost: {}, // 已选择的地点
      // posList: [{"parent":[],"address":"荆长路","distance":[],"pname":"浙江省","importance":[],"biz_ext":{"cost":[],"rating":[]},"biz_type":[],"cityname":"杭州市","type":"商务住宅;楼宇;商务写字楼","photos":[{"title":[],"url":"http://store.is.autonavi.com/showpic/7b797929e9ac00ceef1438f548c88023"},{"title":[],"url":"http://store.is.autonavi.com/showpic/c5c47df1ed82625f5f2b5a675af52626"},{"title":[],"url":"http://store.is.autonavi.com/showpic/4c61cbd3011350ccbc938651ce22f0d5"}],"typecode":"120201","shopinfo":"0","poiweight":[],"childtype":[],"adname":"余杭区","name":"同花顺","location":"120.046178,30.292359","tel":[],"shopid":[],"id":"B0FFGDY3WV"},{"parent":"B0FFGDY3WV","address":"荆长大道","distance":[],"pname":"浙江省","importance":[],"biz_ext":{"cost":[],"rating":[]},"biz_type":[],"cityname":"杭州市","type":"公司企业;公司;公司","photos":[{"title":[],"url":"http://store.is.autonavi.com/showpic/c3a7821ca86301b300e567912b34cb95"},{"title":[],"url":"http://store.is.autonavi.com/showpic/b5a29403a7a9e897133232f5f090a647"},{"title":[],"url":"http://store.is.autonavi.com/showpic/7d54cbc3beb54244b3cd606eabb3b6ca"}],"typecode":"170200","shopinfo":"0","poiweight":[],"childtype":"202","adname":"余杭区","name":"同花顺新大楼总部","location":"120.046353,30.292516","tel":"0571-88911818","shopid":[],"id":"B0FFHOA6TX"},{"parent":"B0FFGDY3WV","address":"邱桥路","distance":[],"pname":"浙江省","importance":[],"biz_ext":{"cost":[],"rating":[]},"biz_type":[],"cityname":"杭州市","type":"公司企业;公司;公司","photos":[{"title":[],"url":"http://store.is.autonavi.com/showpic/8d66e2185e42eb3f166896644af26029"}],"typecode":"170200","shopinfo":"0","poiweight":[],"childtype":"202","adname":"余杭区","name":"同花顺网络信息股份有限公司","location":"120.046089,30.292543","tel":[],"shopid":[],"id":"B0FFLCH9QC"},{"parent":"B0FFGDY3WV","address":"同顺街18号同花顺大楼4层","distance":[],"pname":"浙江省","importance":[],"biz_ext":{"cost":[],"rating":[]},"biz_type":[],"cityname":"杭州市","type":"公司企业;公司;公司","photos":[],"typecode":"170200","shopinfo":"0","poiweight":[],"childtype":"202","adname":"余杭区","name":"杭州同花顺数据开发有限公司","location":"120.046162,30.292381","tel":"0571-88911818","shopid":[],"id":"B0FFK8472Y"},{"parent":"B0FFGDY3WV","address":"同顺街与邱桥路交叉口东180米","distance":[],"pname":"浙江省","importance":[],"biz_ext":{"cost":[],"rating":[]},"biz_type":[],"cityname":"杭州市","type":"交通设施服务;停车场;公共停车场","parking_type":"地下","photos":[],"typecode":"150904","shopinfo":"2","poiweight":[],"childtype":"305","adname":"余杭区","name":"同花顺地下停车场","location":"120.045700,30.292287","tel":[],"shopid":[],"id":"B0HGZ520UI"},{"parent":"B0FFGDY3WV","address":"同顺街与邱桥路交叉口东北180米","distance":[],"pname":"浙江省","importance":[],"biz_ext":{"cost":[],"rating":[]},"biz_type":[],"cityname":"杭州市","type":"交通设施服务;停车场;公共停车场","parking_type":"地面","photos":[],"typecode":"150904","shopinfo":"2","poiweight":[],"childtype":"305","adname":"余杭区","name":"同花顺停车场","location":"120.045572,30.292367","tel":[],"shopid":[],"id":"B0HGZ51TG8"},{"parent":"B0FFGDY3WV","address":"溪沁街与光明桥路交叉口西南160米","distance":[],"pname":"浙江省","importance":[],"biz_ext":{"cost":[],"rating":[]},"biz_type":[],"cityname":"杭州市","type":"金融保险服务;金融保险服务机构;金融保险机构","photos":[],"typecode":"160000","shopinfo":"2","poiweight":[],"childtype":"202","adname":"余杭区","name":"浙江核新同花顺保险经纪有限公司","location":"120.046412,30.292584","tel":[],"shopid":[],"id":"B0FFGY7HQ7"},{"parent":[],"address":"邱桥路45号","distance":[],"pname":"浙江省","importance":[],"biz_ext":{"cost":[],"rating":[]},"biz_type":[],"cityname":"杭州市","type":"商务住宅;商务住宅相关;商务住宅相关","photos":[],"typecode":"120000","shopinfo":"1","poiweight":[],"childtype":[],"adname":"余杭区","name":"同花顺云软件大厦","location":"120.043673,30.290386","tel":"0571-88911818","shopid":[],"id":"B0G2KZSUJF"},{"parent":[],"address":"同顺街同花顺二期(五常地铁站C口步行480米)","distance":[],"pname":"浙江省","importance":[],"biz_ext":{"cost":[],"rating":[]},"biz_type":[],"cityname":"杭州市","type":"公司企业;公司企业;公司企业","photos":[],"typecode":"170000","shopinfo":"0","poiweight":[],"childtype":[],"adname":"余杭区","name":"同花顺二期建设杭州湾工地","location":"120.046564,30.293778","tel":[],"shopid":[],"id":"B0FFLIZRKT"},{"parent":"B023B07VSZ","address":"文二西路1号元茂大厦9层(古翠路地铁站D口旁)","distance":[],"pname":"浙江省","importance":[],"biz_ext":{"cost":[],"rating":[]},"biz_type":[],"cityname":"杭州市","type":"公司企业;公司;网络科技","photos":[{"title":[],"url":"http://store.is.autonavi.com/showpic/f60bc8c9afdb2ff7a4f31416ce57e894"}],"typecode":"170206","shopinfo":"0","poiweight":[],"childtype":"202","adname":"西湖区","name":"浙江同花顺云软件有限公司","location":"120.118294,30.281709","tel":"0571-88911818;0571-87006940","shopid":[],"id":"B0FFF3ZWRY"},{"parent":"B0HGZ51TG8","address":"同顺街与邱桥路交叉口东160米","distance":[],"pname":"浙江省","importance":[],"biz_ext":{"cost":[],"rating":[]},"biz_type":[],"cityname":"杭州市","type":"交通设施服务;停车场;停车场出入口","photos":[],"typecode":"150909","shopinfo":"2","poiweight":[],"childtype":"108","adname":"余杭区","name":"同花顺停车场(出入口)","location":"120.045639,30.291861","tel":[],"shopid":[],"id":"B0HGZ53P9F"},{"parent":"B0HGZ520UI","address":"同顺街与邱桥路交叉口东180米","distance":[],"pname":"浙江省","importance":[],"biz_ext":{"cost":[],"rating":[]},"biz_type":[],"cityname":"杭州市","type":"交通设施服务;停车场;停车场出入口","photos":[],"typecode":"150909","shopinfo":"2","poiweight":[],"childtype":"108","adname":"余杭区","name":"同花顺地下停车场(出入口)","location":"120.045683,30.292092","tel":[],"shopid":[],"id":"B0HGZ532KM"},{"parent":"B0FFGATM4B","address":"五常街道荆长大道与创意三路交叉口同花顺大楼","distance":[],"pname":"浙江省","importance":[],"biz_ext":{"cost":[],"rating":[]},"biz_type":[],"cityname":"杭州市","type":"商务住宅;楼宇;商务写字楼","photos":[],"typecode":"120201","shopinfo":"0","poiweight":[],"childtype":"308","adname":"余杭区","name":"理想·西溪金座C座","location":"120.042388,30.290268","tel":[],"shopid":[],"id":"B0FFFYUAZ6"},{"parent":[],"address":"同顺街盛奥铭座10幢1单元802室(同花顺大楼旁)","distance":[],"pname":"浙江省","importance":[],"biz_ext":{"cost":"5909.00","rating":"4.5"},"biz_type":[],"cityname":"杭州市","type":"体育休闲服务;运动场馆;健身中心","photos":[{"title":[],"url":"http://store.is.autonavi.com/showpic/1c06c12bfa97613d6d1e844d881f7f23"},{"title":[],"url":"http://store.is.autonavi.com/showpic/9c275c419f1ca165e66478d68ea881e9"},{"title":[],"url":"http://store.is.autonavi.com/showpic/9cc09def1a9edbe7a8dca0ff10887496"}],"typecode":"080111","shopinfo":"0","poiweight":[],"childtype":[],"adname":"余杭区","name":"中田健身工作室(西溪铭座店)","location":"120.042858,30.291788","tel":"0571-87557793","shopid":[],"id":"B0FFIJ1802"}], // 地点列表
      radius: 2000, // 搜索半径
      // mealList: [{"parent":[],"address":"西溪八方城10号楼下沉广场地下一层西北角(1号铺、2号铺)AP12号","distance":"113","pname":"浙江省","importance":[],"biz_ext":{"cost":[],"opentime2":[],"rating":"3.7","open_time":[],"meal_ordering":"0"},"biz_type":"diner","cityname":"杭州市","type":"餐饮服务;中餐厅;中餐厅","photos":[{"title":[],"url":"https://img.alicdn.com/imgextra/i1/3695320962/O1CN01TXFtVO1Iydi3SxQyB_!!3695320962-0-kbcontentapng.jpg"},{"title":[],"url":"https://img.alicdn.com/imgextra/i1/3695320962/O1CN01V7gCRJ1Iydi8tyA0P_!!3695320962-0-kbcontentapng.jpg"},{"title":[],"url":"https://img.alicdn.com/imgextra/i1/3695320962/O1CN01c0MvfK1IydhynXsGG_!!3695320962-0-kbcontentapng.jpg"}],"typecode":"050100","shopinfo":"0","poiweight":[],"childtype":[],"adname":"余杭区","name":"湖南浏阳蒸菜(八方城店)","location":"120.044977,30.290453","tel":"18969965010","shopid":[],"id":"B0GKNN4ES2"},{"parent":[],"address":"五常街道同顺街74号未来悦1栋临街商铺","distance":"119","pname":"浙江省","importance":[],"biz_ext":{"cost":"48.00","opentime2":"09:00-02:00","rating":"4.5","open_time":"09:00-02:00","meal_ordering":"0"},"biz_type":"diner","cityname":"杭州市","type":"餐饮服务;中餐厅;潮州菜","photos":[{"title":[],"url":"http://store.is.autonavi.com/showpic/ba80e9afe82355e2128c097dcc33c065"},{"title":[],"url":"http://store.is.autonavi.com/showpic/beec272fffaa9992f0df0c0c9c68a87b"},{"title":[],"url":"http://store.is.autonavi.com/showpic/9849bf26dd009630b0b69b97f500e38e"}],"typecode":"050123","shopinfo":"1","poiweight":[],"childtype":[],"adname":"余杭区","name":"伙头记潮汕海鲜砂锅粥(八方城店)","location":"120.045260,30.291908","tel":"13537866393","shopid":[],"id":"B0G2OXJBEL"},{"parent":[],"address":"五常街道未来悦1幢底商(同顺街76号)","distance":"123","pname":"浙江省","importance":[],"biz_ext":{"cost":"68.00","opentime2":"10:00-24:00","rating":"4.3","open_time":"10:00-24:00","meal_ordering":"0"},"biz_type":"diner","cityname":"杭州市","type":"餐饮服务;餐饮相关场所;餐饮相关","photos":[{"title":[],"url":"http://store.is.autonavi.com/showpic/19308902cedbf84cf3c13ad30cacfac3"},{"title":[],"url":"https://img.alicdn.com/imgextra/i2/3695320962/O1CN017Z46QJ1IydhZLEQP1_!!3695320962-0-kbcontentapng.jpg"},{"title":[],"url":"https://img.alicdn.com/imgextra/i2/3695320962/O1CN01EOoIF21IydhadiwIE_!!3695320962-0-kbcontentapng.jpg"}],"typecode":"050000","shopinfo":"1","poiweight":[],"childtype":[],"adname":"余杭区","name":"老周蚝有趣","location":"120.045288,30.291891","tel":"13868174585","shopid":[],"id":"B0G01ARTSU"},{"parent":[],"address":"五常街道西溪润景大厦1幢102室-4","distance":"142","pname":"浙江省","importance":[],"biz_ext":{"cost":[],"opentime2":[],"rating":"2.2","open_time":[],"meal_ordering":"0"},"biz_type":"diner","cityname":"杭州市","type":"餐饮服务;中餐厅;中餐厅","photos":[],"typecode":"050100","shopinfo":"0","poiweight":[],"childtype":[],"adname":"余杭区","name":"纪师傅炒饭·铁锅现炒","location":"120.045177,30.293302","tel":[],"shopid":[],"id":"B0HRO7KVDY"},{"parent":[],"address":"溪沁街与邱桥路交叉口东140米","distance":"143","pname":"浙江省","importance":[],"biz_ext":{"cost":[],"opentime2":[],"rating":"4.0","open_time":[],"meal_ordering":"0"},"biz_type":"diner","cityname":"杭州市","type":"餐饮服务;中餐厅;中餐厅","photos":[],"typecode":"050100","shopinfo":"0","poiweight":[],"childtype":[],"adname":"余杭区","name":"久旧炸鸡·国潮饭","location":"120.045177,30.293310","tel":[],"shopid":[],"id":"B0GK9XRFDT"},{"parent":[],"address":"邱桥路与溪沁街交叉口向东20米(西溪润景大厦1栋102-3-4)","distance":"150","pname":"浙江省","importance":[],"biz_ext":{"cost":[],"opentime2":[],"rating":[],"open_time":[],"meal_ordering":"0"},"biz_type":"diner","cityname":"杭州市","type":"餐饮服务;中餐厅;中餐厅","photos":[],"typecode":"050100","shopinfo":"0","poiweight":[],"childtype":[],"adname":"余杭区","name":"饭有料·大碗便当","location":"120.045006,30.293204","tel":[],"shopid":[],"id":"B0H1ML267Q"},{"parent":[],"address":"同顺街84号","distance":"161","pname":"浙江省","importance":[],"biz_ext":{"cost":"23.00","opentime2":"09:00-20:30","rating":"4.3","open_time":"09:00-20:30","meal_ordering":"0"},"biz_type":"diner","cityname":"杭州市","type":"餐饮服务;中餐厅;中餐厅","photos":[{"title":[],"url":"http://store.is.autonavi.com/showpic/1977ceb56c0d997c36c78935b26e6a02"}],"typecode":"050100","shopinfo":"0","poiweight":[],"childtype":[],"adname":"余杭区","name":"码堂盖码饭(余杭店)","location":"120.044771,30.291874","tel":"18305863446;18767174589","shopid":[],"id":"B0G3VBA2GY"},{"parent":[],"address":"同顺街未来悦","distance":"170","pname":"浙江省","importance":[],"biz_ext":{"cost":[],"opentime2":"08:00-20:30","rating":"4.4","open_time":"08:00-20:30","meal_ordering":"0"},"biz_type":"diner","cityname":"杭州市","type":"餐饮服务;餐饮相关场所;餐饮相关","photos":[{"title":[],"url":"http://store.is.autonavi.com/showpic/160dde9e45c5ddd7ce802696db7e8afa"}],"typecode":"050000","shopinfo":"0","poiweight":[],"childtype":[],"adname":"余杭区","name":"巧乐客","location":"120.044513,30.291835","tel":[],"shopid":[],"id":"B0H04K2JJP"},{"parent":[],"address":"浙江省杭州市余杭区西溪润景大厦1幢106-2","distance":"173","pname":"浙江省","importance":[],"biz_ext":{"cost":"44.00","opentime2":"11:00-21:00","rating":"4.3","open_time":"11:00-21:00","meal_ordering":"0"},"biz_type":"diner","cityname":"杭州市","type":"餐饮服务;快餐厅;快餐厅","photos":[{"title":"尖椒炒干豆腐","url":"https://img.alicdn.com/imgextra/i1/2206703430527/O1CN017SLsRT1FlPQPZhOOd_!!2206703430527-0-koubei.jpg"},{"title":"香辣肉丝","url":"https://img.alicdn.com/imgextra/i1/2206703430527/O1CN018UHgMB1FlPQKQOUCV_!!2206703430527-0-koubei.jpg"},{"title":"酸菜粉条菜","url":"https://img.alicdn.com/imgextra/i1/2206703430527/O1CN01I6Om3h1FlPQHiiJcW_!!2206703430527-0-koubei.jpg"}],"typecode":"050300","shopinfo":"0","poiweight":[],"childtype":[],"adname":"余杭区","name":"刘三妹春饼铺子","location":"120.045157,30.293681","tel":"18757139799;18367119857","shopid":[],"id":"B0H1OCQK7U"},{"parent":"B0FFL7L4F1","address":"五常街道西溪润景大厦1幢109-2(北门商铺)","distance":"182","pname":"浙江省","importance":[],"biz_ext":{"cost":[],"opentime2":[],"rating":"4.1","open_time":[],"meal_ordering":"0"},"biz_type":"diner","cityname":"杭州市","type":"餐饮服务;餐饮相关场所;餐饮相关","photos":[{"title":[],"url":"http://store.is.autonavi.com/showpic/1589ef09b4ea4826b700ce5a4b27c0cb"},{"title":[],"url":"http://store.is.autonavi.com/showpic/ff37a61643b2bc55d2b21974e7aef56c"}],"typecode":"050000","shopinfo":"0","poiweight":[],"childtype":"202","adname":"余杭区","name":"叫了只炸鸡(西溪总店)","location":"120.045046,30.293706","tel":"13868040255","shopid":[],"id":"B0FFLAD2MH"},{"parent":[],"address":"西溪润景大厦1幢106(五常地铁站B口步行450米)","distance":"183","pname":"浙江省","importance":[],"biz_ext":{"cost":"77.00","opentime2":"11:00-24:00","rating":"4.4","open_time":"11:00-24:00","meal_ordering":"0"},"biz_type":"diner","cityname":"杭州市","type":"餐饮服务;餐饮相关场所;餐饮相关","photos":[{"title":[],"url":"http://aos-cdn-image.amap.com/sns/ugccomment/4426c8d6-7eb0-40b8-99d5-2c7670e99028.jpg"},{"title":[],"url":"http://aos-cdn-image.amap.com/sns/ugccomment/98137765-926b-4c47-9faa-74f0694b62d1.jpg"},{"title":[],"url":"http://aos-cdn-image.amap.com/sns/ugccomment/919f697e-8793-4e8a-a066-03502c503e53.png"}],"typecode":"050000","shopinfo":"0","poiweight":[],"childtype":[],"adname":"余杭区","name":"刘三妹碳火烤肉","location":"120.045011,30.293688","tel":"18757139799","shopid":[],"id":"B0H12Z7P1F"},{"parent":"B0FFL7L4F1","address":"五常街道西溪润景大厦1幢107-1室","distance":"185","pname":"浙江省","importance":[],"biz_ext":{"cost":"77.00","opentime2":"10:00-23:00","rating":"4.7","open_time":"10:00-23:00","meal_ordering":"0"},"biz_type":"diner","cityname":"杭州市","type":"餐饮服务;中餐厅;中餐厅","photos":[{"title":[],"url":"http://store.is.autonavi.com/showpic/3dc57d41e6ef229b5cb088f3566d15e7"},{"title":[],"url":"http://store.is.autonavi.com/showpic/04c88711ceade2f792d4f3d39c850c61"},{"title":[],"url":"http://store.is.autonavi.com/showpic/0db4901754c19596af538bac6f43b559"}],"typecode":"050100","shopinfo":"0","poiweight":[],"childtype":"202","adname":"余杭区","name":"吉成小馆(西溪润景店)","location":"120.044974,30.293678","tel":"18857891349;18767157605","shopid":[],"id":"B0FFI0Q1D9"},{"parent":[],"address":"五常街道溪沁街258号知识产权产业园区2幢","distance":"185","pname":"浙江省","importance":[],"biz_ext":{"cost":[],"opentime2":[],"rating":"2.5","open_time":[],"meal_ordering":"0"},"biz_type":"diner","cityname":"杭州市","type":"餐饮服务;咖啡厅;咖啡厅","photos":[],"typecode":"050500","shopinfo":"0","poiweight":[],"childtype":[],"adname":"余杭区","name":"咖世家咖啡.快选(五常店)","location":"120.045418,30.293978","tel":[],"shopid":[],"id":"B0H1RUA8OH"},{"parent":[],"address":"五常街道溪沁街西溪润景大厦1幢101室","distance":"190","pname":"浙江省","importance":[],"biz_ext":{"cost":[],"opentime2":"10:00-23:00","rating":"3.9","open_time":"10:00-23:00","meal_ordering":"0"},"biz_type":"diner","cityname":"杭州市","type":"餐饮服务;餐饮相关场所;餐饮相关","photos":[{"title":[],"url":"http://store.is.autonavi.com/showpic/7ec1172ce21242c5b995039da0e59e64"}],"typecode":"050000","shopinfo":"0","poiweight":[],"childtype":[],"adname":"余杭区","name":"张水儿炸鸡·中式·拒绝厚重面粉(杭州西溪店)","location":"120.044553,30.293239","tel":"17357155306","shopid":[],"id":"B0IG3Z2EAJ"},{"parent":[],"address":"五常街道溪沁街258号知识产权创新产业园c座一楼美食城","distance":"190","pname":"浙江省","importance":[],"biz_ext":{"cost":[],"opentime2":[],"rating":"3.9","open_time":[],"meal_ordering":"0"},"biz_type":"diner","cityname":"杭州市","type":"餐饮服务;快餐厅;快餐厅","photos":[{"title":[],"url":"http://store.is.autonavi.com/showpic/e3fc1f7d6e78469abac7d634143057ff"}],"typecode":"050300","shopinfo":"0","poiweight":[],"childtype":[],"adname":"余杭区","name":"禄阿姨菜饭骨头汤(未来科技城店)","location":"120.045564,30.294089","tel":"18173223601;13520194500","shopid":[],"id":"B0H65LPVTG"},{"parent":[],"address":"溪沁街豪波西溪润景","distance":"193","pname":"浙江省","importance":[],"biz_ext":{"cost":[],"opentime2":[],"rating":"3.5","open_time":[],"meal_ordering":"0"},"biz_type":"diner","cityname":"杭州市","type":"餐饮服务;快餐厅;快餐厅","photos":[{"title":[],"url":"http://store.is.autonavi.com/showpic/7a9c3ea61ccc1a85daffa87a47a2bdd6"}],"typecode":"050300","shopinfo":"0","poiweight":[],"childtype":[],"adname":"余杭区","name":"烤鱼烩面","location":"120.044888,30.293704","tel":[],"shopid":[],"id":"B0HR0KJW6K"},{"parent":"B0FFL7L4F1","address":"五常街道西溪润景大厦1幢108室","distance":"194","pname":"浙江省","importance":[],"biz_ext":{"cost":"50.00","opentime2":"【正常】全年10:00-22:00","rating":"4.6","open_time":"10:00-22:00","meal_ordering":"0"},"biz_type":"diner","cityname":"杭州市","type":"餐饮服务;中餐厅;四川菜(川菜)","photos":[{"title":[],"url":"http://store.is.autonavi.com/showpic/678f58f7518dbafa5dece70eb5d096f2"},{"title":[],"url":"http://store.is.autonavi.com/showpic/0568d0d85e056d121b6d78e3b0e2b12f"},{"title":[],"url":"http://store.is.autonavi.com/showpic/bcb6e5e975413aec323148a984616b3a"}],"typecode":"050102","shopinfo":"0","poiweight":[],"childtype":"202","adname":"余杭区","name":"莘玥川菜(西溪润景店)","location":"120.044871,30.293703","tel":"18883520405;18989471930","shopid":[],"id":"B0FFJ1WJ6S"}], // 餐饮列表
      mealList: [],
      selectMealList: [], // 勾选的餐饮列表
      result: "", // 最终选择的结果
      // result: "纪师傅炒饭·铁锅现炒", // 最终选择的结果
      
      debounceTime: null, //输入框防抖
      page:1, //结果查找页面
      hasMore: true
    }
  },
watch: {
  keywords: {
    handler(val) {
      clearTimeout(this.debounceTime)
      setTimeout(() => {
        if (val) {
          axios.get(`https://restapi.amap.com/v3/place/text?key=${AMAP_AK}&keywords=${val}`).then(response => {
            this.posList = response.data.pois;
          })
        }
        else {
          this.posList = [];
        }
      },800)
    }
  }
},
  methods: {
    selectPos(pos) {
      this.selectedPost = pos;
      this.posList = [];
      this.mealList = [];
      this.page = 1;
      this.result = "";
    },
    searchNear() {
      if (!this.selectedPost.name) {
        Toast("请选择地点后进行搜索")
        return;
      }
      axios.get(`https://restapi.amap.com/v3/place/around?key=${AMAP_AK}&location=${this.selectedPost.location}&types=050100|050200|050300&radius=${this.radius || 2000}&offset=25&page=1`).then(response => {
        this.mealList = response.data.pois;
        this.selectMealList = this.mealList.map(item => item.name);//默认全部选中
      })
    },
    moreMeal() {
      this.page++
      axios.get(`https://restapi.amap.com/v3/place/around?key=${AMAP_AK}&location=${this.selectedPost.location}&types=050100|050200|050300&radius=${this.radius || 2000}&offset=25&page=${this.page}`).then(response => {
        let data = response.data.pois;
        if (!data.length) {
          this.hasMore = false;
        }
        this.mealList.push(...data);
        this.selectMealList.push(...data.map(item => item.name))
      })
    },
    rollMeal() {
      this.result = this.selectMealList[Math.floor(Math.random() * this.selectMealList.length)]
    }
  }
}
</script>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  width: 500px;
  background: #f7f8fa;
  margin: auto;
  padding: 40px;
}
.posContainer {
  height: 500px;
  overflow-y: scroll;
  .posItem {
    padding: 10px;
    text-align: left;
    cursor: pointer;
    height: 40px;
    .posName {
      font-size: 20px;
    }
    .posAddress {
      font-size: 10px;
      color: #667572;
    }
  }
}
.mealContainer {
  height: 400px;
  overflow-y: scroll;
}

.resultLabel {
  margin-top: 20px;
  text-align: left;
  color: #667572;
}
.result {
  .name {
    font-size: 30px;
  }
  .address {
    color: #667572;
  }
}

/*定义滚动条高宽及背景
 高宽分别对应横竖滚动条的尺寸*/
::-webkit-scrollbar
{
    width:8px;
    height:8px;
    background-color:#F5F5F5;
}
/*定义滚动条轨道
 内阴影+圆角*/
::-webkit-scrollbar-track
{
    -webkit-box-shadow:inset 0 0 6px rgba(0,0,0,0.1);
    border-radius:10px;
    background-color:#F5F5F5;
}
/*定义滑块
 内阴影+圆角*/
::-webkit-scrollbar-thumb
{
    border-radius:10px;
    -webkit-box-shadow:inset 0 0 6px rgba(0,0,0,.1);
    background-color:#667572;
}

</style>
