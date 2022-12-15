<template>
  <div>
    <h1>{{ main_text }}</h1>
    <h1>{{ play_text }}</h1>
    <h1 v-if="is_gaveup">{{ giveup_text }}</h1>
    <h1 v-else>{{ score_text }}</h1>
    <b-button v-if="is_gaming" @click="reverseKey"
      >키 반전 {{ reverse_key_text }}</b-button
    >
    <b-button v-if="is_gaming" @click="giveUp">항복하기</b-button>
    <b-button v-if="is_end" @click="goHome">home</b-button>
  </div>
</template>

<script setup lang="ts">
import { UserData } from "@/store/UserData";
import { onBeforeUnmount, onMounted, onUnmounted, ref, inject } from "vue";
import router from "@/router";

const reverse_key_text = ref("on");
const main_text = ref();
const giveup_text = ref();
const play_text = ref();
const score_text = ref();
const is_gaveup = ref(false);
const is_gaming = ref(false);
const is_end = ref(false);
const inject_setInviteGameUnavailable: () => void = inject(
  "setInviteGameUnavailable"
);

main_text.value = "Waiting for Player...";
play_text.value = "...";
score_text.value = "...";

// 게임 시작
UserData.socket.on("game/start", (s_p1_id: number, s_p2_id: number) => {
  inject_setInviteGameUnavailable();
  main_text.value = "Pong!";
  play_text.value = s_p1_id + " vs " + s_p2_id;
  score_text.value = "0 : 0";
  is_gaming.value = true;
  window.addEventListener("keydown", move);
});

// 관전 시작
UserData.socket.on("game/watchStart", (s_p1_id: string, s_p2_id: string) => {
  main_text.value = "Watch Pong!";
  play_text.value = s_p1_id + " vs " + s_p2_id;
  score_text.value = "0 : 0";
});

UserData.socket.on(
  "game/nextRound",
  (s_p1_score: number, s_p2_score: number) => {
    score_text.value = s_p1_score + " : " + s_p2_score;
  }
);

UserData.socket.on(
  "game/end",
  (
    s_p1_id: string,
    s_p2_id: string,
    s_p1_score: number,
    s_p2_score: number
  ) => {
    is_gaming.value = false;
    if (s_p1_score > s_p2_score) {
      main_text.value = "winner : " + s_p1_id;
      play_text.value = "loser : " + s_p2_id;
    } else {
      main_text.value = "winner : " + s_p2_id;
      play_text.value = "loser : " + s_p1_id;
    }
    score_text.value = s_p1_score + " : " + s_p2_score;
    gameOver();
  }
);

UserData.socket.on("game/giveUp", (s_player_id: string) => {
  is_gaveup.value = true;
  giveup_text.value = s_player_id + "이 기권했습니다!";
});

function reverseKey() {
  UserData.socket.emit("game/reverse");
  if (reverse_key_text.value == "off") {
    reverse_key_text.value = "on";
  } else {
    reverse_key_text.value = "off";
  }
}

function giveUp() {
  UserData.socket.emit("game/giveUp");
}

function gameOver() {
  window.removeEventListener("keydown", move);
  is_end.value = true;
}

function move(event: KeyboardEvent) {
  if (event.key == "ArrowUp") {
    UserData.socket.emit("game/move", "up");
  } else if (event.key == "ArrowDown") {
    UserData.socket.emit("game/move", "down");
  }
}

function goHome() {
  router.push({ name: "home" });
}

async function exitGame() {
  await UserData.socket.emit("game/exit", "");
}

onMounted(async () => {
  window.addEventListener("beforeunload", await exitGame);
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", exitGame);
});

onUnmounted(() => {
  UserData.socket.removeAllListeners("game/start");
  UserData.socket.removeAllListeners("game/watchStart");
  UserData.socket.removeAllListeners("game/nextRound");
  UserData.socket.removeAllListeners("game/end");
  window.removeEventListener("keydown", move);
});
</script>
