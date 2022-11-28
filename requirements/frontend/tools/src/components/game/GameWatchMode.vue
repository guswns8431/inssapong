<template>
  <div></div>
</template>

<script setup lang="ts">
import { UserData } from "@/store/UserData";
import { onMounted } from "vue";
import { useRoute } from "vue-router";

const player_id = String(useRoute().params.player_id);

function watching() {
  UserData.socket.emit("game/watch", player_id);
}

onMounted(() => {
  watching();
});
</script>
