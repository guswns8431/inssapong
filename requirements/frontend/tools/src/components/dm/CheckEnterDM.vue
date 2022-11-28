<template>
  <div></div>
</template>

<script setup lang="ts">
import { UserData } from "@/store/UserData";
import { useRoute } from "vue-router";
import router from "@/router";

const route = useRoute();
const receiver_id = route.params.receiver_id;

if (receiver_id == UserData.user_id) {
  alert("url이 잘못 설정되었습니다!");
  router.back();
}
</script>
