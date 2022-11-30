<template>
  <div></div>
</template>

<script setup lang="ts">
import router from "@/router";
import { UserData } from "@/store/UserData";
import axios, { AxiosRequestConfig } from "axios";
import { inject, onMounted } from "vue";
import { VueCookies } from "vue-cookies";

const cookies: VueCookies | undefined = inject<VueCookies>("$cookies");
const token = cookies.get("Authorization");
const inject_setCheckLoginAvailable: () => void = inject(
  "setCheckLoginAvailable"
);

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
async function checkTwoFactor() {
  try {
    await instance.get("/login/twofactor");
  } catch (err) {
    console.log("Error : CheckTwoFactor.vue checkTwoFactor() 함수 " + err);
    inject_setCheckLoginAvailable();
    router.push({ name: "home" });
  }
}

async function checkFirstLogin() {
  try {
    await instance.get("/login/signup");
  } catch (err) {
    console.log("Error : FirstLogin.vue : checkFirstLogin() 오류 : + " + err);
    inject_setCheckLoginAvailable();
    router.push({ name: "home" });
  }
}

onMounted(async () => {
  if (window.location.pathname == "/twofactor") {
    checkTwoFactor();
  } else if (window.location.pathname == "/signup") {
    checkFirstLogin();
  }
});
</script>
