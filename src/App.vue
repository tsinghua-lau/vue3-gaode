<template>
  <div class="nav-bar">
    <ul>
      <li><a href="#/">demo1</a></li>
      <li><a href="#/mymap">demo2</a></li>
      <li><a href="#/one">demo3</a></li>
    </ul>
  </div>
  <router-view />
</template>

<script setup></script>

<style>
* {
  margin: 0;
  padding: 0;
}
html,
body {
  height: 100%;
  width: 100%;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
}
html,
body,
#app {
  background: #011230 !important;
  width: 100%;
  height: 100%;
}
.nav-bar {
  position: absolute;
  left: 6%;
  top: 13%;
  z-index: 999;
}

a {
  color: #fff;
}
</style>
