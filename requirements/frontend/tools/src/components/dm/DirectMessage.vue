<template>
  <b-card class="msgBox">
    <h1>{{ route.params.receiver_id }}</h1>
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
        @keypress.enter.prevent="sendDM"
        @input="changeMessage"
        no-resize
      ></b-form-textarea>
      <b-button @click="sendDM">메세지 전송</b-button>
    </div>
  </b-card>
</template>

<script setup lang="ts">
import { UserData } from "@/store/UserData";
import { ref, nextTick, onMounted } from "vue";
import { useRoute } from "vue-router";

const receive_message = ref([{ sender: "", message: "" }]);
const send_message = ref();
const route = useRoute();
const element = ref();
const receiver_id = route.params.receiver_id;

// 메세지 받기
UserData.socket.on(
  "DM/send",
  (s_sender_id: string, s_receiver_id: string, s_message: string) => {
    if (s_sender_id == receiver_id || s_receiver_id == receiver_id) {
      receive_message.value.push({ sender: s_sender_id, message: s_message });
      scrollDown();
    }
  }
);

// dm 송신
function sendDM() {
  const data = `{"sender_id" : "${UserData.user_id}",
				  "receiver_id" : "${receiver_id}",
				  "message" : "${send_message.value}"}`;
  UserData.socket.emit("channel/send", data);
  send_message.value = "";
}

// 이전 dm 전송
function enteredDM() {
  const data = `{"user_id" : "${UserData.user_id}",
				  "partner_id" : "${receiver_id}"}`;
  UserData.socket.emit("channel/enteredDM", data);
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
  enteredDM();
});
</script>

<style scoped>
.sendMessageBox {
  display: -webkit-inline-box;
}

.receiveMessageBox {
  height: 22em;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
</style>
