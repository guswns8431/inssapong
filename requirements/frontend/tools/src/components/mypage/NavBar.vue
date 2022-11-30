<template>
  <b-card class="div_margin">
    <b-container>
      <b-row>
        <b-col><h2>INSSA-PONG</h2> </b-col>
        <b-col md="auto">
          <b-form @submit.prevent="submitForm" class="search_form_style">
            <b-form-input type="text" v-model="search_id" />
            <b-button variant="outline-dark" type="submit" class="search_btn"
              >검색</b-button
            >
          </b-form>
        </b-col>
        <b-col cols="5">
          <b-button variant="outline-info" @click="goHomeView">홈</b-button>
          <b-button variant="outline-success" @click="goMypageView"
            >마이페이지!</b-button
          >
          <b-button variant="outline-dark" @click="goEditProfile"
            >프로필 수정</b-button
          >
          <b-button variant="outline-primary" @click="goChatView"
            >채팅창으로!</b-button
          >
          <b-button variant="outline-danger" @click="logout">로그아웃</b-button>
        </b-col>
      </b-row>
    </b-container>
  </b-card>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { inject, ref } from "vue";
import { UserData } from "@/store/UserData";
import { VueCookies } from "vue-cookies";

const cookies: VueCookies = inject<VueCookies>("$cookies");
const router = useRouter();
const search_id = ref("");
const inject_init: () => void = inject("init");

function goHomeView() {
  router.push({ name: "home" });
}

function goMypageView() {
  router.push({ name: "mypage" });
}

function goEditProfile() {
  router.push({ name: "editprofile" });
}

function goChatView() {
  router.push({ name: "channelHome" });
}

async function logout() {
  cookies.keys().forEach((cookie) => cookies.remove(cookie));
  alert("logout!");
  inject_init();
  router.push({ name: "start" });
}

function submitForm() {
  if (search_id.value == UserData.user_id) {
    router.push({ name: "mypage" });
    return;
  }
  UserData.instance
    .get(`/users/${search_id.value}`)
    .then(() => {
      router.push({
        name: "userinfopage",
        query: { userId: search_id.value },
      });
    })
    .catch((err) => {
      alert("안돼~돌아가~멈춰!!");
      console.log(err);
    });
}
</script>

<style scoped>
.btn {
  margin: 0.1em;
}
.search_btn {
  width: 4em;
}
.search_form_style {
  display: flex;
}
.div_margin {
  margin: 3em;
}
</style>
