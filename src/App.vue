<script setup lang="ts">
import { Toast } from "vant";
import 'vant/es/toast/style';
import axios, { type AxiosResponse } from "axios"
import { ref, unref, watch, onMounted, type Ref, computed } from 'vue';
const AMAP_AK: string = "ce431934e2a0963df9b1c665eefc8314";

const keywords: Ref<string> = ref("") // 地点搜索关键词
const posList: Ref<Array<any>> = ref([]) // 地点列表
const selectedPos: Ref<any> = ref() // 已选择的地点
const radius: Ref<number> = ref(2000) // 搜索半径
const mealList: Ref<Array<any>> = ref([]) // 餐厅列表
const selectMealList: Ref<Array<any>> = ref([]) // 勾选的餐厅列表
const result: Ref<string> = ref("") // 最终选择的结果

const page: Ref<number> = ref(1) // 查找结果的页码
const hasMore: Ref<Boolean> = ref(true) // 是否还有更多结果

const keywordsInput: Ref<any> = ref() // 关键词文本框

let selectAllMeal = computed({
  get: () => unref(selectMealList).length === unref(mealList).length,
  set: (val: Boolean) => {
    if (val) {
      selectMealList.value = unref(mealList)
    }
    else {
      selectMealList.value = []
    }
  }
})

/**
 * 搜索防抖
 */
function debounce(fn: Function) {
  let timer: number;
  return (val: any) => {
    if (timer) clearInterval(timer)
    timer = setTimeout(() => {
      fn(val)
    }, 100)
  }
}

onMounted(() => {
  document.title = "今天吃什么"
  locateByIp()
})

let watchKeyWords = watch(keywords, debounce((val: any) => {
  if (val) {
    axios
      .get(
        `https://restapi.amap.com/v3/place/text?key=${AMAP_AK}&keywords=${val}`
      )
      .then((response: AxiosResponse) => {
        posList.value = response.data.pois;
      });
  } else {
    posList.value = [];
  }
}))

/**
 * 通过IP进行定位
 */
function locateByIp() {
  axios.get(`https://restapi.amap.com/v3/ip?key=${AMAP_AK}`).then((response: AxiosResponse) => {
    const { status, province, city, rectangle } = response.data;
    if (status === "0") {
      Toast("定位失败，请您手动输入完整的省市地址")
    }
    else {
      let address: string = province + city;
      Toast(`定位到您在${address}，请进一步输入详细地址`)
      watchKeyWords()// 暂时停止keywords的监听避免弹出无效地址
      keywords.value = address
      // 重新开始对keywords的监听
      watchKeyWords = watch(keywords, debounce((val: any) => {
        if (val) {
          axios
            .get(
              `https://restapi.amap.com/v3/place/text?key=${AMAP_AK}&keywords=${val}`
            )
            .then((response: AxiosResponse) => {
              posList.value = response.data.pois;
            });
        } else {
          posList.value = [];
        }
      }))
      unref(keywordsInput).focus()
    }
  })
}

/**
 * 选择地点
 * @param pos 地点对象
 */
function selectPos(pos: Object) {
  selectedPos.value = unref(pos);
  posList.value = [];
  mealList.value = [];
  page.value = 1;
  result.value = "";
}

/**
 * 搜索附近的店铺
 */
function searchNear() {
  if (!unref(selectedPos)?.name) {
    Toast("请选择地点后进行搜索");
    return;
  }
  axios
    .get(
      `https://restapi.amap.com/v3/place/around?key=${AMAP_AK}&location=${unref(selectedPos).location
      }&types=050100|050200|050300&radius=${unref(radius) || 2000
      }&offset=25&page=1`
    )
    .then((response: AxiosResponse) => {
      mealList.value = response.data.pois;
      selectMealList.value = unref(mealList).map((item) => item.name); //默认全部选中
    });
}

/**
 * 加载更多餐厅
 */
function moreMeal() {
  page.value = page.value + 1
  axios
    .get(
      `https://restapi.amap.com/v3/place/around?key=${AMAP_AK}&location=${unref(selectedPos).location
      }&types=050100|050200|050300&radius=${unref(radius) || 2000
      }&offset=25&page=${unref(page)}`
    )
    .then((response: AxiosResponse) => {
      let data = response.data.pois;
      if (!data.length) {
        hasMore.value = false;
      }
      mealList.value.push(...data);
      selectMealList.value.push(...data.map((item: { name: string }) => item.name));
    });
}

/**
 * 随机选择餐厅
 */
function rollMeal() {
  result.value =
    unref(selectMealList)[
    Math.floor(Math.random() * unref(selectMealList).length)
    ];
}

</script>

<template>
  <div id="page">
    <van-cell-group>
      <van-field v-model="keywords" ref="keywordsInput" label="地点搜索" placeholder="输入地点搜索（最好带城市）">
        <!-- <template #button>
          <van-button @click="locateByIp" size="small" type="primary">定位</van-button>
        </template> -->
      </van-field>
      <div v-if="posList.length" class="posContainer">
        <div @click="selectPos(item)" class="posItem" v-for="item in posList" :key="item.id">
          <div class="posName">{{ item.name }}</div>
          <div class="posAddress">
            {{ `${item.pname}${item.cityname}${item.adname}${item.address}` }}
          </div>
        </div>
      </div>
      <van-field readonly :model-value="selectedPos?selectedPos.name:''" label="已选择地点"
        placeholder="在上方输入关键词后选择地点" />
      <van-field v-model="radius" type="digit" label="范围（米）" placeholder="查找的半径" />
    </van-cell-group>
    <van-button @click="searchNear" type="primary" block style="margin: 20px 0">查找</van-button>
    <div v-if="mealList.length" class="mealContainer">
      <van-checkbox v-model="selectAllMeal">全选</van-checkbox>
      <van-checkbox-group v-model="selectMealList">
        <van-checkbox style="margin: 5px 0" v-for="item in mealList" :key="item.id" :name="item.name">{{ item.name }}
        </van-checkbox>
      </van-checkbox-group>
      <div v-if="hasMore" @click="moreMeal">查看更多</div>
    </div>
    <van-button v-if="selectMealList.length" @click="rollMeal" type="primary" block style="margin: 20px 0">今天吃啥！
    </van-button>
    <div v-if="result" class="resultLabel">今天要吃的是：</div>
    <div v-if="result" class="result">
      <div class="name">
        {{ result }}
      </div>
      <div class="address">
        {{ mealList.find((item) => item.name == result).address }}
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
#page {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  width: 100vw;
  max-width: 500px;
  margin: auto;
  background: #f7f8fa;
  padding: 40px;
}

.posContainer {
  height: 500px;
  overflow-y: scroll;

  .posItem {
    padding: 10px;
    text-align: left;
    cursor: pointer;
    min-height: 40px;

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
  height: 250px;
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
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  background-color: #f5f5f5;
}

/*定义滚动条轨道
 内阴影+圆角*/
::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  background-color: #f5f5f5;
}

/*定义滑块
 内阴影+圆角*/
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
  background-color: #667572;
}
</style>
