<template>
  <CheckLogin v-if="checklogin_available == true"></CheckLogin>
  <CheckPreLogin v-if="checkpreLogin_available == true"></CheckPreLogin>
  <CatchDBError v-if="socket_available == true"></CatchDBError>
  <GameInvite v-if="socket_available == true"></GameInvite>
  <router-view v-if="router_available == true" :key="$route.fullPath" />
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, provide, ref } from "vue";
import CheckLogin from "./components/CheckLogin.vue";
import CatchDBError from "@/components/CatchDBError.vue";
import GameInvite from "./components/game/GameInvite.vue";
import CheckPreLogin from "./components/CheckPreLogin.vue";
import { UserData } from "./store/UserData";

const router_available = ref(false);
const checklogin_available = ref(false);
const checkpreLogin_available = ref(false);
checklogin_available.value =
  window.location.pathname != "/" &&
  window.location.pathname != "/twofactor" &&
  window.location.pathname != "/signup";
checkpreLogin_available.value =
  window.location.pathname == "/twofactor" ||
  window.location.pathname == "/signup";

const socket_available = ref(false);

router_available.value = !checklogin_available.value;

function setAvailableRouter() {
  router_available.value = true;
  socket_available.value = true;
}
provide("setAvailableRouter", setAvailableRouter);

function setUnavailableRouter() {
  router_available.value = true;
}
provide("setUnavailableRouter", setUnavailableRouter);

function setCheckLoginAvailable() {
  checklogin_available.value = true;
  router_available.value = true;
}
provide("setCheckLoginAvailable", setCheckLoginAvailable);

async function exitGame() {
  if (socket_available.value == true)
    await UserData.socket.emit("game/exit", "");
}

onMounted(async () => {
  window.addEventListener("beforeunload", await exitGame);
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", exitGame);
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  position: relative;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
