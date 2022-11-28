<template>
  <div class="my_info_style">
    <div class="profile_image">
      <b-img rounded alt="Rounded image" :src="user_image" />
    </div>
    <b-card title="내 정보" class="user_info">
      <b-card-body class="user_info_body">
        <h4>{{ user_nickname }} ({{ UserData.user_id }})</h4>
        <div class="twoFactor">
          2차인증
          <BButton
            variant="outline-success"
            v-if="is_active == true"
            @click="changeActive"
            >on</BButton
          >
          <BButton variant="outline-danger" v-else @click="changeActive"
            >off</BButton
          >
        </div>
        <b-progress
          v-if="!(win == 0 && lose == 0)"
          class="mt-2 w-100"
          :max="100"
          show-value
        >
          <b-progress-bar :value="win_rate" variant="success"></b-progress-bar>
          <b-progress-bar
            :value="100 - win_rate"
            variant="danger"
          ></b-progress-bar>
        </b-progress>
        <b-progress v-else class="mt-2 w-100" :max="100">
          <b-progress-bar value="0"></b-progress-bar>
        </b-progress>
        <p>승 {{ win }} 패 {{ lose }} 승률 {{ win_rate }}%</p>
        <br />
      </b-card-body>
    </b-card>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { UserData } from "@/store/UserData";

const user_image = ref();
const user_nickname = ref("");
const win = ref();
const lose = ref();
const win_rate = ref();
const is_active = ref<boolean>();

function changeActive() {
  if (is_active.value == true) {
    is_active.value = false;
  } else {
    is_active.value = true;
  }
  UserData.instance
    .patch("/mypage", {
      twofactor_status: is_active.value,
    })
    .catch((err) => {
      console.log("Error : MyPageView.vue : changeActive() 오류 : " + err);
    });
}

function getUserInfo() {
  UserData.instance
    .get("/mypage")
    .then((res) => {
      user_nickname.value = res.data.nickname;
      user_image.value = res.data.avatar;
      is_active.value = res.data.twofactor_status;
    })
    .catch((err) => {
      console.log("Error : MyPageView.vue : getUserInfo() 오류 : " + err);
    });
}

function getGameStat() {
  UserData.instance
    .get("/mypage/gameStat")
    .then((res) => {
      win.value = res.data.wins;
      lose.value = res.data.loses;
      if (win.value == 0) {
        win_rate.value = 0;
      } else {
        win_rate.value = ((win.value / (win.value + lose.value)) * 100).toFixed(
          2
        );
      }
    })
    .catch((err) => {
      console.log("Error : MyPageView.vue : getGameStat() 함수 오류 " + err);
    });
}

onMounted(() => {
  getUserInfo();
  getGameStat();
});
</script>
<style scoped>
.my_info_style {
  display: flex;
  font-size: large;
}

.profile_image {
  margin: 10px 5px;
  padding: auto;
}

.user_info {
  width: 100%;
  margin: 10px 5px;
}

.user_info_body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

img {
  height: 300px;
  width: 300px;
}
</style>
