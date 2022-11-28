<template>
  <div>
    <div>
      <NavBar></NavBar>
      <div class="mypage_container">
        <div class="mypage_container1">
          <MyInfo></MyInfo>
          <GameHistory></GameHistory>
        </div>
        <MyFriendList></MyFriendList>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import MyInfo from "@/components/mypage/MyInfo.vue";
import GameHistory from "@/components/mypage/MyGameHistory.vue";
import MyFriendList from "@/components/mypage/MyFriendList.vue";
import NavBar from "@/components/mypage/NavBar.vue";
</script>

<style>
.mypage_container1 {
  display: grid;
  grid-template-rows: repeat(2, 1fr);
}
.mypage_container {
  margin: 3em;
  display: grid;
  grid-template-columns: 3fr 1fr;
}
</style>
