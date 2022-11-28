<template>
  <b-card class="msgBox">
    <h1>{{ channel_name }}</h1>
    <div class="receiveMessageBox">
      <div :key="i.message" v-for="i in receive_message">
        <span v-if="i.sender">{{ i.sender }} : {{ i.message }}</span>
      </div>
    </div>
    <div class="sendMessageBox">
      <b-form-textarea
        class="inputBox"
        maxlength="90"
        placeholder="Input Message(90자제한)"
        rows="1"
        v-model="send_message"
        @keypress.enter.prevent="sendMessage"
        @input="changeMessage"
        no-resize
      ></b-form-textarea>
      <b-button style="width: 4em" @click="sendMessage">전송</b-button>
    </div>
  </b-card>
</template>

<script setup lang="ts">
import router from "@/router";
import { UserData } from "@/store/UserData";
import { ref, nextTick, onMounted } from "vue";
import { useRoute } from "vue-router";

interface message {
  sender: string;
  message: string;
}

const receive_message = ref([{} as message]);
const send_message = ref();
const route = useRoute();
const channel_id = route.params.channel_id;
const element = ref();
const channel_name = ref("");

// 메세지 받기
UserData.socket.on("channel/send", (s_send_id: string, s_message: string) => {
  receive_message.value.push({ sender: s_send_id, message: s_message });
  scrollDown();
});

// 명령어 실패
UserData.socket.on("channel/commandFailed", (s_error: string) => {
  receive_message.value.push({ sender: "[SERVER]", message: s_error });
  scrollDown();
});

// ban, kick 당했을 때 채널 페이지 exit
UserData.socket.on("channel/exit", (s_command) => {
  alert(`${s_command} 당했습니다!`);
  router.push({ name: "chat" });
});

function getChannelName() {
  UserData.instance
    .get("/channels/room/name", {
      params: {
        channel_id: `${channel_id}`,
      },
    })
    .then((res) => {
      channel_name.value = res.data;
    })
    .catch((err) => {
      console.log(err);
    });
}

// 메세지 전송
function sendMessage() {
  const data = `{"sender_id" : "${UserData.user_id}",
                "channel_id" : "${channel_id}",
                "message" : "${send_message.value}"}`;
  UserData.socket.emit("channel/send", data);
  send_message.value = "";
}

function changeMessage(e: Event) {
  send_message.value = e;
}

async function scrollDown() {
  await nextTick();
  element.value = document.querySelector(
    ".receiveMessageBox"
  ) as HTMLInputElement;
  element.value.scrollTo({
    top: element.value.scrollHeight,
    behavior: "smooth",
  });
}

onMounted(() => {
  getChannelName();
});
</script>

<style scoped>
.sendMessageBox {
  display: flex;
}

.receiveMessageBox {
  height: 22em;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
</style>
