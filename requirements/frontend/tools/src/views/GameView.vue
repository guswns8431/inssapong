<template>
  <div>
    <GameComponent></GameComponent>
    <GamePlayer v-if="game_mode == true"></GamePlayer>
    <GameWatchMode v-if="watch_mode == true"></GameWatchMode>
    <GameCanvas></GameCanvas>
  </div>
</template>

<script setup lang="ts">
import GameCanvas from "@/components/game/GameCanvas.vue";
import GameComponent from "@/components/game/GameComponent.vue";
import GamePlayer from "@/components/game/GamePlayMode.vue";
import GameWatchMode from "@/components/game/GameWatchMode.vue";
import { UserData } from "@/store/UserData";
import { onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const game_mode = route.name == "game" || route.name == "invitedGame";
const watch_mode = !game_mode;
const room_id = ref("");

UserData.socket.on("game/getRoomId", (s_room_id: string) => {
  room_id.value = s_room_id;
});

async function exitGameView() {
  await UserData.socket.emit("game/exit", room_id.value);
}

onUnmounted(async () => {
  await exitGameView();
});
</script>

<style></style>
