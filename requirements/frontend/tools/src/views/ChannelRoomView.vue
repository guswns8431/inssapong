<template>
  <CheckEntered></CheckEntered>
  <div v-if="channel_available == true">
    <h1>Channel</h1>
    <NavBar></NavBar>
    <div class="chatView">
      <b-card class="left_block">
        <MessageWindow></MessageWindow>
      </b-card>
      <b-card class="right_block">
        <PartiUser></PartiUser>
        <div>
          <BButton class="exitBtn" @click="exitChannel">나가기</BButton>
          <BButton class="goChatHome" @click="goChatHome">채팅 홈</BButton>
        </div>
      </b-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import PartiUser from "../components/channel/PartiUser.vue";
import CheckEntered from "@/components/channel/CheckEntered.vue";
import MessageWindow from "@/components/channel/ChannelMessage.vue";
import NavBar from "@/components/mypage/NavBar.vue";
import { useRouter, useRoute } from "vue-router";
import { UserData } from "@/store/UserData";
import { onUnmounted, ref } from "vue";

const router = useRouter();
const route = useRoute();
const channel_available = ref(false);
const channel_id = route.params.channel_id;

UserData.socket.on("channel/checkEnteredSuccess", () => {
  channel_available.value = true;
});

function goChatHome() {
  router.push({ name: "channelHome" });
}

function exitChannel() {
  UserData.instance
    .delete("/channels/room/exit", {
      params: {
        channel_id: `${channel_id}`,
      },
    })
    .then(() => {
      router.push({ name: "channelHome" });
    })
    .catch((err: object) => {
      console.log(err);
      alert("나가기 실패!");
    });
}

onUnmounted(() => {
  UserData.socket.removeAllListeners("channel/checkEnteredSuccess");
});
</script>

<style scoped>
@font-face {
  font-family: "ChosunCentennial";
  src: url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2206-02@1.0/ChosunCentennial.woff2")
    format("woff2");
  font-weight: normal;
  font-style: normal;
}

BButton {
  margin: 0.2em;
}

.chatView {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin: 3em 0em;
}
.left_block {
  width: 60%;
  margin-right: 5px;
  background-color: rgb(245, 245, 245);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.right_block {
  width: 25%;
  height: 30em;
  margin-left: 5px;
  overflow: auto;
  background-color: rgb(245, 245, 245);
}

.right_block::-webkit-scrollbar {
  display: none;
}
</style>
