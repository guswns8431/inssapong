<template>
  <div>
    <div>
      <NavBar></NavBar>
      <div class="userpage_container">
        <div class="userpage_container1">
          <UserInfo></UserInfo>
          <UserGameHistory></UserGameHistory>
        </div>
        <UserInteractBar :user_id="`${user_id}`"></UserInteractBar>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRoute } from "vue-router";
import NavBar from "@/components/mypage/NavBar.vue";
import UserInfo from "@/components/userpage/UserInfo.vue";
import UserGameHistory from "@/components/userpage/UserGameHistory.vue";
import UserInteractBar from "@/components/userpage/UserInteractBar.vue";

const route = useRoute();
const user_id = route.query.userId;
</script>
<style>
.userpage_container1 {
  display: grid;
  grid-template-rows: repeat(2, 1fr);
}
.userpage_container {
  margin: 3em;
  display: grid;
  grid-template-columns: 3fr 1fr;
}
</style>
