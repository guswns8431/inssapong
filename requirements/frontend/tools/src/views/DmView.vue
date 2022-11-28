<template>
  <CheckEnterDM></CheckEnterDM>
  <div>
    <h1>DM with {{ receiver_id }}</h1>
    <NavBar></NavBar>
    <div class="dmView">
      <b-card class="left_block">
        <DirectMessage></DirectMessage>
      </b-card>
      <b-card class="right_block">
        <UserStatus :id="receiver_id"></UserStatus>
        <b-button
          squared
          style="padding: 0.2em"
          variant="outline-secondary"
          @click="userProfile(receiver_id)"
        >
          프로필보기
        </b-button>
      </b-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import CheckEnterDM from "@/components/dm/CheckEnterDM.vue";
import DirectMessage from "@/components/dm/DirectMessage.vue";
import UserStatus from "@/components/UserStatus.vue";
import NavBar from "@/components/mypage/NavBar.vue";

const route = useRoute();
const router = useRouter();
const receiver_id = String(route.params.receiver_id);

function userProfile(user_id: string) {
  router.push({
    name: "userinfopage",
    query: { userId: user_id },
  });
}
</script>

<style scoped>
@font-face {
  font-family: "ChosunCentennial";
  src: url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2206-02@1.0/ChosunCentennial.woff2")
    format("woff2");
  font-weight: normal;
  font-style: normal;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  margin: 0;
}
div {
  box-sizing: border-box;
}

.dmView {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-direction: row;
  margin: 3em 0em;
}
.left_block {
  width: 60%;
  height: 30em;
  margin-right: 5px;
  overflow: auto;
  background-color: rgb(245, 245, 245);
}

.left_block::-webkit-scrollbar {
  display: none;
}
.right_block {
  width: 25%;
  margin-left: 5px;
  overflow: auto;
  background-color: rgb(245, 245, 245);
}
.right_block::-webkit-scrollbar {
  display: none;
}
</style>
