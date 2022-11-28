<template>
  <div class="start">
    <button type="button" @click="move42Oauth">로그인</button>
    그치만,,클릭하지마,,
  </div>
</template>

<script setup lang="ts">
function move42Oauth() {
  location.href = "http://localhost:3000/login/42";
}
</script>
