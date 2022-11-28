import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import StartView from "../views/StartView.vue";

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
  },
  {
    path: "/editprofile",
    name: "editprofile",
    component: () => import("../views/EditProfile.vue"),
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
  },
  {
    path: "/dm/:receiver_id",
    name: "dm",
    component: () => import("../views/DmView.vue"),
  },
  {
    path: "/channel/:channel_id",
    name: "channel",
    component: () => import("../views/ChannelRoomView.vue"),
  },
  {
    path: "/userinfopage",
    name: "userinfopage",
    component: () => import("../views/UserInfoPage.vue"),
  },
  {
    path: "/mypage",
    name: "mypage",
    component: () => import("../views/MyPageView.vue"),
  },
  {
    path: "/game",
    name: "game",
    component: () => import("../views/GameView.vue"),
  },
  {
    path: "/game/:player_id",
    name: "invitedGame",
    component: () => import("../views/GameView.vue"),
  },
  {
    path: "/watchgame/:player_id",
    name: "watchgame",
    component: () => import("../views/GameView.vue"),
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
