<template>
  <div v-if="user.id">
    <div v-if="now == 0">
      <b-avatar
        :text="`${user.id[0]}`"
        badge
        badge-variant="success"
      ></b-avatar>
      {{ user.id }}
      <b-button variant="success" @click="inviteGame">게임초대</b-button>
    </div>
    <div v-else-if="now == 1">
      <b-avatar :text="`${user.id[0]}`" badge badge-variant="danger"></b-avatar>
      {{ user.id }}
    </div>
    <div v-else-if="now == 2">
      <b-avatar :text="`${user.id[0]}`" badge badge-variant="light"></b-avatar>
      {{ user.id }}
      <b-button variant="primary" @click="watchGame()"> 관전 </b-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { UserData } from "@/store/UserData";
import router from "@/router";

const user = defineProps({
  id: String,
});
const now = ref();

function watchGame() {
  router.push(`/watchGame/${user.id}`);
}

function emitStatus() {
  UserData.socket.emit("getUserStatus", user.id);
}

function inviteGame() {
  const data = `{"user_id" : "${UserData.user_id}",
                "partner_id" : "${user.id}"}`;
  UserData.socket.emit("game/invite", data);
}

UserData.socket.on(`game/successInvited/${user.id}`, () => {
  router.push({
    name: "invitedGame",
    params: { player_id: `${user.id}` },
  });
});

UserData.socket.on(`getUserStatus_${user.id}`, (s_status: number) => {
  now.value = s_status;
});

onMounted(() => {
  emitStatus();
});
</script>

<style scoped></style>
