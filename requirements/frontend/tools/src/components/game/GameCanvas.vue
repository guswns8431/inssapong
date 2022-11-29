<template>
  <div>
    <canvas class="game_canvas_style" ref="game_canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { UserData } from "@/store/UserData";
import { onMounted, onUnmounted, ref } from "vue";

const game_canvas = ref();
let canvas: CanvasRenderingContext2D;
let bar_width: number;
let bar_height: number;
let ball_radius: number;

// 게임 시작
UserData.socket.on(
  "game/initCanvas",
  (s_ball_radius: number, s_bar_width: number, s_bar_height: number) => {
    ball_radius = s_ball_radius;
    bar_width = s_bar_width;
    bar_height = s_bar_height;
  }
);

// canvas에 그리기
UserData.socket.on(
  "game/draw",
  (
    s_ball_x: number,
    s_ball_y: number,
    s_p1_x: number,
    s_p1_y: number,
    s_p2_x: number,
    s_p2_y: number
  ) => {
    canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
    canvas.beginPath();
    canvas.arc(s_ball_x, s_ball_y, ball_radius, 0, 360);
    canvas.rect(s_p1_x, s_p1_y, bar_width, bar_height);
    canvas.rect(s_p2_x, s_p2_y, bar_width, bar_height);
    canvas.fillStyle = "black";
    canvas.fill();
    canvas.stroke();
  }
);

UserData.socket.on("game/endCanvas", () => {
  canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
  canvas.beginPath();
  canvas.stroke();
});

onMounted(() => {
  canvas = game_canvas.value.getContext("2d");
});

onUnmounted(() => {
  UserData.socket.removeAllListeners("game/initCanvas");
  UserData.socket.removeAllListeners("game/draw");
  UserData.socket.removeAllListeners("game/endCanvas");
});
</script>

<!-- h: 150 w: 300-->
<style scoped>
.game_canvas_style {
  width: 50rem;
  height: 30rem;
  border: 1px solid grey;
}
</style>
