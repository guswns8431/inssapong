<template>
  <div>
    <h1>Error!</h1>
    <b-button @click="goHome">home</b-button>
  </div>
</template>
<script setup lang="ts">
import router from "@/router";

function goHome() {
  router.push({ name: "home" });
}
</script>
