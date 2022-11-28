<template>
  <div></div>
</template>

<script setup lang="ts">
import { UserData } from "@/store/UserData";
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import router from "@/router";

const route = useRoute();
const channel_id = route.params.channel_id;

// 입장할 수 없는 채널에 들어갈 시
UserData.socket.on("channel/checkEnteredFail", () => {
  alert("입장 불가인 채널입니다.");
  router.push({ name: "channelHome" });
});

// 채널에 들어갈 수 있나(dm에 있나)확인
function enter() {
  const data = `{"user_id": "${UserData.user_id}", "channel_id": "${channel_id}" }`;
  UserData.socket.emit("channel/checkEntered", data);
}

onMounted(() => {
  enter();
});
</script>
