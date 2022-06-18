<!-- 省界自定义样式 -->
<template>
  <div class="box">
    <!-- 高德地图容器 -->
    <div id="container"></div>
  </div>
</template>

<script setup>
import { MapKey, MapSecretKey } from "../config/mapConfig";
import { useRouter } from "vue-router";

const router = useRouter();

window._AMapSecurityConfig = {
  securityJsCode: `${MapSecretKey}`,
};

//高德API加载器 安装命令： npm i @amap/amap-jsapi-loader
import AMapLoader from "@amap/amap-jsapi-loader";
//热力图模拟数据
import { onBeforeMount, onMounted, ref } from "vue";

//Vue什么周期 挂载前
onBeforeMount(() => {
  initMap
    .then((ok) => {
      //加载行政区查询插件
      initDistrictSearch();
      //绘制默认地区边界
      // searchAndBounds("河北省");
    })
    .catch((err) => {
      console.log(err);
    });
});

// 地图容器
var map;

//行政区查询容器
var district;
//行政区边界数据暂存
var polygons = [];

// 初始化地图函数
const initMap = new Promise((resolve, reject) => {
  AMapLoader.load({
    key: `${MapKey}`, // 申请好的Web端开发者Key，首次调用 load 时必填
    //!!! 2.0 许多插件名与老版本不同
    version: "1.4.15", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15。 2.0地图加载慢，地图上下留有网格空白，本人小白找不到原因
    plugins: [
      // 需要使用的的插件列表，如比例尺'AMap.Scale'等
    ],
  })
    .then((AMap) => {
      map = new AMap.Map("container", {
        //设置地图容器id
        viewMode: "3D", //是否为3D地图模式
        zoom: 7, //初始化地图级别
        center: [116.418261, 39.921984], //初始化地图中心点位置
        mapStyle: "amap://styles/93d6a789e97e2ead1bd9fee260a7ac20",
      });

      map.setFeatures(["road", "bg"]);
      let southwest = getLnglatByDistAndAngle(
        652,
        [116.468664, 39.537057],
        227
      );
      let northeast = getLnglatByDistAndAngle(652, [116.468664, 39.537057], 43);

      let b = new AMap.Bounds(
        [southwest[0], southwest[1]],
        [northeast[0], northeast[1]]
      );
      map.setLimitBounds(new AMap.Bounds(southwest, northeast));

      var imageLayer = new AMap.ImageLayer({
        // url: require("./bbg.png"),
        url: new URL("./bbg.jpg", import.meta.url).href,
        bounds: b,
        zooms: [2, 20],
        // opacity: 0.5,
      });
      map.add(imageLayer);
      let cityData = [
        {
          title: "唐山市",
          position: [117.611242, 39.778112],
        },
        {
          title: "张家口市",
          position: [114.885895, 40.768931],
        },
        {
          title: "承德市",
          position: [116.798254, 41.198462],
        },

        {
          title: "秦皇岛市",
          position: [118.830725, 40.039356],
        },
        {
          title: "保定市",
          position: [114.480139, 39.039631],
        },
        {
          title: "廊坊市",
          position: [116.064916, 39.303664],
        },

        {
          title: "衡水市",
          position: [115.668987, 37.739367],
        },
        {
          title: "沧州市",
          position: [116.838715, 38.304676],
        },
        {
          title: "石家庄市",
          position: [114.514976, 38.042007],
        },
        {
          title: "邯郸市",
          position: [114.53915, 36.6258497],
        },
        {
          title: "邢台市",
          position: [114.765783, 37.548025],
        },
      ];

      createPoints(cityData, true);

      //操作成功
      resolve();
    })
    .catch((e) => {
      //操作失败
      reject(e);
    });
});

const nextDemo = () => {
  console.log(111);
  router.push({
    path: "/mymap",
  });
};

//传入需要打点的数组-arr,type是否带title
function createPoints(arr, type) {
  let cityArr = [];
  if (type) {
    arr.map((city) => {
      let markerObj = city;
      var markerContent =
        '<div class="custom-content-marker">' + city.title + "</div>";
      markerObj.content = markerContent;

      var mark = new AMap.Marker(markerObj);
      cityArr.push(mark);
    });
  } else {
    arr.map((city) => {
      let markerObj = city;
      var markerContent = '<div class="custom-content-marker">' + "</div>";
      markerObj.content = markerContent;

      var mark = new AMap.Marker(markerObj);
      cityArr.push(mark);
    });
  }

  map.add(cityArr);
}
//角度
function getLnglatByDistAndAngle(dist, lnglat, angle) {
  let dealDist = dist / Math.sin((45 * Math.PI) / 180);
  const currlng = lnglat[0];
  const currlat = lnglat[1];
  const lng =
    currlng +
    (dealDist * Math.sin((angle * Math.PI) / 180)) /
      (111 * Math.cos((currlat * Math.PI) / 180));
  const lat =
    currlat +
    (dealDist * Math.sin((angle * Math.PI) / 180)) /
      (130 * Math.cos((currlat * Math.PI) / 180));
  return [lng, lat];
}

//行政区查询插件加载
function initDistrictSearch() {
  AMap.plugin(["AMap.DistrictSearch"], function () {
    //加载行政区划插件
    if (!district) {
      //实例化DistrictSearch
      let opts = {
        subdistrict: 0, //获取边界不需要返回下级行政区
        extensions: "all", //返回行政区边界坐标组等具体信息
        level: "district", //查询行政级别为 区
      };
      district = new AMap.DistrictSearch(opts);
    }
  });
}

//边界查询并绘制
function searchAndBounds(dis) {
  district.search(dis, function (status, result) {
    // 获取边界信息
    let bounds = result.districtList[0].boundaries;
    map.remove(polygons); //清除上次结果
    polygons = [];
    if (bounds) {
      for (let i = 0, l = bounds.length; i < l; i++) {
        //生成行政区划polygon
        let polygon = new AMap.Polygon({
          map: map,
          strokeWeight: 1,
          path: bounds[i],
          fillOpacity: 0,
          fillColor: "red",
          strokeColor: "#031d44",
        });
        polygons.push(polygon);
      }
      // 地图自适应
      map.setFitView();
    }
  });
}
</script>

<style scoped>
.box {
  width: 60%;
  margin-left: 20%;
  height: 100%;
}

#container {
  width: 100%;
  height: 100%;
}
:deep(.custom-content-marker) {
  word-break: keep-all;
  color: #2ddcce;
  font-size: 16px;
  position: relative;
  padding-left: 25px;
  font-weight: 900;
}
:deep(.custom-content-marker::before) {
  content: ".";
  width: 6px;
  height: 6px;
  position: absolute;
  text-indent: -9999px;
  background: #fff;
  display: block;
  top: 3px;
  left: 0;
  border-radius: 10px;
  border: 6px solid #00deff;
  -webkit-box-shadow: 0px 0px 12px #fff;
  box-shadow: 0px 0px 12px #fff;
}
#controller {
  position: absolute;
  z-index: 99;
  top: 20px;
  left: 100px;
  background: white;
  list-style-type: none;
  width: 120px;
}
</style>
