<template>
  <div></div>
</template>

<script setup lang="ts">
import router from "@/router";
import { UserData } from "@/store/UserData";
import axios, { AxiosRequestConfig } from "axios";
import { io } from "socket.io-client";
import { inject, onMounted } from "vue";
import { VueCookies } from "vue-cookies";

const cookies: VueCookies = inject<VueCookies>("$cookies");
const token = cookies.get("Authorization");
const inject_setAvailableRouter: () => void = inject("setAvailableRouter");
const inject_setUnavailableRouter: () => void = inject("setUnavailableRouter");

// axios 생성
const instance = axios.create({
  baseURL: "http://localhost:3000",
});
UserData.instance = instance;

// 쿠키를 헤더 추가
instance.interceptors.request.use(
  (config: AxiosRequestConfig<string>) => {
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => {
    console.log(err);
  }
);

// 서버에 get 요청을 보내 토큰이 유효한가 확인
async function loginCheck() {
  try {
    const response = await instance.get("/loginCheck");
    UserData.user_id = response.data;
    return true;
  } catch (err) {
    cookies.keys().forEach((cookie) => cookies.remove(cookie));
    alert("login 먼저 해주세요!");
    router.push({ name: "start" });
    return false;
  }
}

// socket 서버에 연결
async function socketConnect() {
  const s_client = await io(
    `http://localhost:3000?user_id=${UserData.user_id}`
  ).connect();
  UserData.socket = s_client;
}

onMounted(async () => {
  const is_login = await loginCheck();
  if (is_login == true) {
    await socketConnect();
    inject_setAvailableRouter();
  } else {
    inject_setUnavailableRouter();
  }
});
</script>
