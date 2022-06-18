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
  //这里的安全密钥不写会导致 行政区查询等API无法使用
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
      "AMap.DistrictSearch",
      // 需要使用的的插件列表，如比例尺'AMap.Scale'等
    ],
  })
    .then((AMap) => {
      var options = {
        subdistrict: 0,
        extensions: "all",
        level: "province",
      };
      var district = new AMap.DistrictSearch(options);
      //查询北京市区域
      district.search("北京市", function (status, result) {
        var bounds = result.districtList[0]["boundaries"];
        var mask = [];
        for (var i = 0; i < bounds.length; i++) {
          mask.push([bounds[i]]);
        }
        //实例化地图
        map = new AMap.Map("container", {
          mask: mask,
          //设置地图容器id
          zooms: [7, 20], //最小显示级别为7，最大显示级别为20
          viewMode: "3D", //是否为3D地图模式
          zoom: 9, //初始化地图级别
          center: [116.418261, 39.921984], //初始化地图中心点位置
          mapStyle: "amap://styles/d17421840b00f59f797cb7364f989433",
        });
        //添加描边
        for (var i = 0; i < bounds.length; i++) {
          new AMap.Polyline({
            path: bounds[i],
            strokeColor: "#000",
            strokeWeight: 2,
            map: map,
          });
        }
      });
      map.setFeatures(["road", "bg"]);

      //操作成功
      resolve();
    })
    .catch((e) => {
      //操作失败
      reject(e);
    });
});

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
