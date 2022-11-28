<template>
  <div>
    <b-card class="interact" title="현재 상태">
      <UserStatus :id="user.user_id"></UserStatus>
      <b-button variant="success" @click="directMessage"
        >메세지 보내기</b-button
      >
      <div v-if="relation_status == RELATION.UNFOLLOW">
        <b-button variant="success" @click="doFollow">팔로우</b-button>
        <b-button variant="danger" @click="doBlock">차단</b-button>
      </div>
      <div v-else-if="relation_status == RELATION.FOLLOW">
        <b-button variant="danger" @click="doUnFollow">팔로우 끊기</b-button>
        <b-button variant="danger" @click="doBlock">차단</b-button>
      </div>
      <div v-else-if="relation_status == RELATION.BLOCK">
        <b-button variant="success" @click="doFollow">팔로우</b-button>
        <b-button variant="danger" @click="doUnBlock">차단 해제</b-button>
      </div>
    </b-card>
  </div>
</template>

<script setup lang="ts">
import UserStatus from "@/components/UserStatus.vue";
import router from "@/router";
import { useRoute } from "vue-router";
import { onMounted, ref } from "vue";
import { UserData } from "@/store/UserData";

const route = useRoute();
const relation_status = ref();
const user = defineProps({
  user_id: String,
});
const RELATION = {
  UNFOLLOW: "0",
  FOLLOW: "1",
  BLOCK: "2",
};

function getFollowStatus() {
  UserData.instance
    .get(`/users/${user.user_id}`)
    .then((res) => {
      relation_status.value = res.data.relation_status;
    })
    .catch((err) => {
      router.back();
      console.log("Error : UserIneractBar.vue : getFollowStatus() 오류 " + err);
    });
}

function doFollow() {
  UserData.instance
    .patch("/users/follow", {
      partner_id: `${user.user_id}`,
      follow_status: true,
    })
    .then(() => {
      relation_status.value = RELATION.FOLLOW;
    })
    .catch((err) => {
      console.log("Error : UserIneractBar.vue : doFollow() 오류 " + err);
    });
}

function doUnFollow() {
  UserData.instance
    .patch("/users/follow", {
      partner_id: `${user.user_id}`,
      follow_status: false,
    })
    .then(() => {
      relation_status.value = RELATION.UNFOLLOW;
    })
    .catch((err) => {
      console.log("Error : UserIneractBar.vue : doUnFollow() 오류 " + err);
    });
}

function directMessage() {
  const user_id = route.query.userId;
  router.push({
    name: "dm",
    params: { receiver_id: `${user_id}` },
  });
}

function doBlock() {
  UserData.instance
    .patch(`/users/block?id=${user.user_id}`)
    .then(() => {
      relation_status.value = RELATION.BLOCK;
    })
    .catch((err) => {
      console.log("Error : UserIneractBar.vue : doBlock() 오류 " + err);
    });
}

function doUnBlock() {
  UserData.instance
    .patch("/users/follow", {
      partner_id: `${user.user_id}`,
      follow_status: false,
    })
    .then(() => {
      relation_status.value = RELATION.UNFOLLOW;
    })
    .catch((err) => {
      console.log("Error : UserIneractBar.vue : doUnBlock() 오류 " + err);
    });
}

onMounted(() => {
  getFollowStatus();
});
</script>

<style scoped>
.interact {
  margin: 10px 5px;
}
</style>
