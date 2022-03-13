<template>
  <!-- 高德地图容器 -->
  <div id="container"></div>
  <ul id="controller">
    <li><input type="checkbox" checked @click="toolbarView($event.target.checked)">工具条</li>
    <li><input type="checkbox" checked @click="scaleView($event.target.checked)">比例条</li>
    <li><input type="checkbox" checked @click="overViewSH($event.target.checked)">鹰眼图</li>
    <li><input type="text" value="北京" @blur="searchAndBounds($event.target.value)"></li>
  </ul>
</template>

<script setup>
import {MapKey, MapSecretKey} from "../config/mapConfig"
// 密钥说明 https://lbs.amap.com/api/javascript-api/guide/abc/prepare
window._AMapSecurityConfig = {
  //这里的安全密钥不写会导致 行政区查询等API无法使用
  securityJsCode: `${MapSecretKey}`,
}

//高德API加载器 安装命令： npm i @amap/amap-jsapi-loader
import AMapLoader from '@amap/amap-jsapi-loader'
//热力图模拟数据
import heatData from '../assets/heatmapData.json'
import {onBeforeMount, onMounted, ref} from "vue";


//Vue什么周期 挂载前
onBeforeMount(() => {
  //地图初始化
  initMap.then((ok) => {
    //成功后加载多个插件
    initPlugins()

    //加载热地图插件
    initHeatMapPlugin()
    //加载行政区查询插件
    initDistrictSearch()
    //绘制默认地区边界
    searchAndBounds('北京')

  }).catch((err) => {
    console.log(err)
  })
})

//工具条显示隐藏
function toolbarView(s){
  s?toolbar.show():toolbar.hide()
}
function scaleView(s) {
  s?scale.show():scale.hide()
}

function overViewSH(s) {
  s?overView.show():overView.hide()
}


// 地图容器
var map
//工具条控件
var toolbar
//比例尺控件
var scale
//鹰眼控件
var overView
//图层切换控件
var mapType
//定位控件
var geolocation
//热力图容器
var heatMap
//行政区查询容器
var district
//行政区边界数据暂存
var polygons = []


// 初始化地图函数
const initMap = new Promise((resolve, reject) => {
  AMapLoader.load({
    "key": `${MapKey}`,              // 申请好的Web端开发者Key，首次调用 load 时必填
    //!!! 2.0 许多插件名与老版本不同
    "version": "1.4.15",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15。 2.0地图加载慢，地图上下留有网格空白，本人小白找不到原因
    "plugins": [          // 需要使用的的插件列表，如比例尺'AMap.Scale'等
      'AMap.ToolBar',
      'AMap.Scale',
      'AMap.OverView',
    ],
  }).then((AMap) => {
    map = new AMap.Map('container', { //设置地图容器id
      viewMode: "3D",    //是否为3D地图模式
      zoom: 5,           //初始化地图级别
      center: [116.418261, 39.921984], //初始化地图中心点位置
      mapStyle: 'amap://styles/darkblue' //设置地图的显示样式
    })

    //同步加载的插件直接添加
    // 在图面添加工具条控件，工具条控件集成了缩放、平移、定位等功能按钮在内的组合控件
    toolbar=new AMap.ToolBar({
      position: 'LT'
    })
    map.addControl(toolbar)
    // 在图面添加比例尺控件，展示地图在当前层级和纬度下的比例尺
    scale=new AMap.Scale()
    map.addControl(scale)
    // 在图面添加鹰眼控件，在地图右下角显示地图的缩略图
    overView=new AMap.OverView({
      isOpen: true,
    })
    map.addControl(overView);


    //操作成功
    resolve()
  }).catch(e => {
    //操作失败
    reject(e)
  })
})

//异步加载多个插件
function initPlugins() {
  AMap.plugin(['AMap.MapType', 'AMap.Geolocation'], function () {
    // 在图面添加类别切换控件，实现默认图层与卫星图、实施交通图层之间切换的控制
    mapType = new AMap.MapType({

    })
    // 在图面添加定位控件，用来获取和展示用户主机所在的经纬度位置
    geolocation = new AMap.Geolocation({
      buttonPosition: 'LB',
      showButton:true //是否显示定位
    })
  })
  map.addControl(mapType)
  map.addControl(geolocation)
}


//热力图插件加载
function initHeatMapPlugin() {
  //JSAPI 2.0版本 AMap.Heatmap 插件改名为 AMap.HeatMap
  AMap.plugin(['AMap.Heatmap'], function () {      //加载热力图插件
    heatMap = new AMap.Heatmap(map, {
      radius: 25, //给定半径
      opacity: [0, 0.8]
      /*,
      gradient:{
          0.5: 'blue',
          0.65: 'rgb(117,211,248)',
          0.7: 'rgb(0, 255, 0)',
          0.9: '#ffea00',
          1.0: 'red'
      }
       */
    })   //在地图对象叠加热力图
    heatMap.setDataSet({data: heatData, max: 100}) //设置热力图数据集
  });
}

//行政区查询插件加载
function initDistrictSearch() {
  AMap.plugin(['AMap.DistrictSearch'], function () {
    //加载行政区划插件
    if (!district) {
      //实例化DistrictSearch
      let opts = {
        subdistrict: 0,      //获取边界不需要返回下级行政区
        extensions: 'all',  //返回行政区边界坐标组等具体信息
        level: 'district'  //查询行政级别为 区
      };
      district = new AMap.DistrictSearch(opts);
    }

  })

}

//边界查询并绘制
function searchAndBounds(dis) {
  district.search(dis, function (status, result) {

    // 获取边界信息
    let bounds = result.districtList[0].boundaries;
    map.remove(polygons)//清除上次结果
    polygons = []
    if (bounds) {
      for (let i = 0, l = bounds.length; i < l; i++) {
        //生成行政区划polygon
        let polygon = new AMap.Polygon({
          map: map,
          strokeWeight: 1,
          path: bounds[i],
          fillOpacity: .2,
          fillColor: '#2161c3',
          strokeColor: '#2161c3'
        })
        polygons.push(polygon)
      }
      // 地图自适应
      map.setFitView()
    }
  })

}


</script>

<style scoped>
#container {
  width: 100%;
  height: 100%;
}
#controller{
  position: absolute;
  z-index: 99;
  top: 20px;
  left: 100px;
  background: white;
  list-style-type: none;
  width: 120px;
}
</style>