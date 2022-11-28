<template>
  <div></div>
</template>

<script setup lang="ts">
import router from "@/router";
import { UserData } from "@/store/UserData";

// server database error
UserData.socket.on("DBError", () => {
  alert("서버 데이터베이스 에러.");
  router.back();
});
</script>
