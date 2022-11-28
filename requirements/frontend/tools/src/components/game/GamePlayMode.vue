<template>
  <div></div>
</template>

<script setup lang="ts">
import { UserData } from "@/store/UserData";
import { onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const param_player_id = route.params.player_id;

function enterGameQueue() {
  UserData.socket.emit("game/enter");
}

function acceptedInviteGame() {
  const data = `{"user_id" : "${UserData.user_id}",
                "partner_id" : "${param_player_id}"}`;
  UserData.socket.emit("game/acceptedInvite", data);
}

onMounted(() => {
  if (param_player_id == undefined) enterGameQueue();
  else acceptedInviteGame();
});
</script>
