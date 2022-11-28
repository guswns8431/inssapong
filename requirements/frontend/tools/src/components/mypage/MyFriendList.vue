<template>
  <div>
    <b-card title="친구 목록" class="friend_list_style">
      <div v-bind:key="friend" v-for="friend in friend_list">
        <b-card>
          <UserStatus :id="friend"></UserStatus>
          <b-button variant="outline-dark" @click="goFriendProfile(friend)"
            >프로필 보기</b-button
          >
        </b-card>
      </div>
    </b-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { UserData } from "@/store/UserData";
import router from "@/router";
import UserStatus from "@/components/UserStatus.vue";

const friend_list = ref([]);

function goFriendProfile(index: string) {
  router.push({
    name: "userinfopage",
    query: { userId: index },
  });
}

function getFriendList() {
  UserData.instance
    .get("/mypage/follows")
    .then((res) => {
      friend_list.value = res.data.follow;
    })
    .catch((err) => {
      console.log("Error : MyPageView.vue : getFriendList() 함수 오류 " + err);
    });
}
onMounted(() => {
  getFriendList();
});
</script>

<style scoped>
.friend_list_style {
  margin: 10px 5px;
}
</style>
