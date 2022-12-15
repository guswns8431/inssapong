import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import StartView from "../views/StartView.vue";
import axios, { AxiosRequestConfig } from "axios";

function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

// 쿠키를 헤더 추가
// 서버에 get 요청을 보내 토큰이 유효한가 확인
async function loginCheck() {
  const token = getCookie("Authorization");

  const instance = axios.create({
    baseURL: "http://localhost:3000",
  });
  if (instance == undefined || token == undefined || token == "") {
    await router.push({ name: "start" });
    router.go(0);
    return false;
  }

  instance.interceptors.request.use(
    (config: AxiosRequestConfig<string>) => {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    async () => {
      await router.push({ name: "start" });
      router.go(0);
    }
  );

  try {
    await instance.get("/loginCheck");
    return true;
  } catch (err) {
    await router.push({ name: "start" });
    router.go(0);
    return false;
  }
}

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "start",
    component: StartView,
  },
  {
    path: "/home",
    name: "home",
    component: () => import("../views/HomeView.vue"),
    beforeEnter: loginCheck,
  },
  {
    path: "/editprofile",
    name: "editprofile",
    component: () => import("../views/EditProfile.vue"),
    beforeEnter: loginCheck,
  },
  {
    path: "/signup",
    name: "signup",
    component: () => import("../views/EditProfile.vue"),
  },
  {
    path: "/twofactor",
    name: "twofactor",
    component: () => import("../views/TwoFactorView.vue"),
  },
  {
    path: "/channel",
    name: "channelHome",
    component: () => import("../views/ChannelHomeView.vue"),
    beforeEnter: loginCheck,
  },
  {
    path: "/dm/:receiver_id",
    name: "dm",
    component: () => import("../views/DmView.vue"),
    beforeEnter: loginCheck,
  },
  {
    path: "/channel/:channel_id",
    name: "channel",
    component: () => import("../views/ChannelRoomView.vue"),
    beforeEnter: loginCheck,
  },
  {
    path: "/userinfopage",
    name: "userinfopage",
    component: () => import("../views/UserInfoPage.vue"),
    beforeEnter: loginCheck,
  },
  {
    path: "/mypage",
    name: "mypage",
    component: () => import("../views/MyPageView.vue"),
    beforeEnter: loginCheck,
  },
  {
    path: "/game",
    name: "game",
    component: () => import("../views/GameView.vue"),
    beforeEnter: loginCheck,
  },
  {
    path: "/game/:player_id",
    name: "invitedGame",
    component: () => import("../views/GameView.vue"),
    beforeEnter: loginCheck,
  },
  {
    path: "/watchgame/:player_id",
    name: "watchgame",
    component: () => import("../views/GameView.vue"),
    beforeEnter: loginCheck,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "Error",
    component: () => import("../views/ErrorView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
