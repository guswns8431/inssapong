<template>
  <div>
    <h1>{{ user_id }}</h1>
    <NavBar></NavBar>
    <div class="gameBox">
      <b-card title="게임" class="gameCard">
        <b-button size="lg" @click="goGameView()" variant="outline-primary"
          >게임 찾으러 가기!</b-button
        >
      </b-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import router from "@/router";
import NavBar from "@/components/mypage/NavBar.vue";
import { UserData } from "@/store/UserData";
import { inject, ref } from "vue";
import { onBeforeRouteUpdate } from "vue-router";

const user_id = ref("");
user_id.value = UserData.user_id;
const inject_init: () => void = inject("init");

function goGameView() {
  router.push({ name: "game" });
}

onBeforeRouteUpdate(async () => {
  console.log("hihihihi");
  inject_init();
});
</script>

<style scoped>
.gameBox {
  display: flex;
  justify-content: center;
}

.gameCard {
  width: 50em;
}
</style>
