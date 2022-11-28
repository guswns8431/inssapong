<template>
  <div class="full_window_style" v-if="toast == true">
    <div class="toast_style" v-if="toast == true">
      <br />
      <h2>{{ title }}</h2>
      <br /><br />
      <h5>{{ body }}</h5>
      <br />
      <b-button @click="acceptedInvite" v-if="title == '게임 초대'"
        >게임 수락</b-button
      >
      <b-button @click="goHome" v-else>home</b-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import router from "@/router";
import { UserData } from "@/store/UserData";
import { ref } from "vue";

const toast = ref(false);
const title = ref("");
const body = ref("");
const partner_id = ref("");

UserData.socket.on("game/invite", (s_user_id) => {
  title.value = "게임 초대";
  body.value = `${s_user_id}가 게임 초대를 보냈습니다!`;
  toast.value = true;
  partner_id.value = s_user_id;
});

UserData.socket.on("game/failAcceptInvite", (s_user_id) => {
  title.value = "게임 입장 실패";
  body.value = `${s_user_id}가 게임을 할 수 없는 상태입니다!`;
  toast.value = true;
});

UserData.socket.on("game/failInvite", (s_user_id) => {
  title.value = "게임 초대 실패";
  body.value = `${s_user_id} 게임 초대 요청이 실패했습니다!`;
  toast.value = true;
  router.push({ name: "home" });
});

UserData.socket.on("game/notInvited", (s_user_id) => {
  title.value = "게임 입장 실패";
  body.value = `${s_user_id}에게 초대를 보내주세요!`;
  toast.value = true;
  router.push({ name: "home" });
});

function setToastFalse() {
  title.value = "";
  body.value = "";
  toast.value = false;
}

function acceptedInvite() {
  setToastFalse();
  router.push({
    name: "invitedGame",
    params: { player_id: `${partner_id.value}` },
  });
}

function goHome() {
  setToastFalse();
  router.push({ name: "home" });
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.full_window_style {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  z-index: 9;
}

.toast_style {
  position: absolute;
  width: 40%;
  height: 30%;
  left: 30%;
  top: 10%;
  z-index: 10;
  background-color: #d7d0e3;
  border-radius: 20px;
}
</style>
