<template>
  <div>
    <h2 style="margin-top: 0.7em; margin-bottom: 0.5em">Members</h2>
    <div :key="i.user_id" v-for="i in user_list">
      <b-card v-if="i.user_id != UserData.user_id && member_available">
        <UserStatus :id="i.user_id"></UserStatus>
        <b-button
          squared
          style="padding: 0.2em"
          variant="outline-secondary"
          @click="userProfile(i.user_id)"
        >
          프로필보기
        </b-button>
      </b-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { onMounted, onUnmounted, ref } from "vue";
import { UserData } from "@/store/UserData";
import UserStatus from "../UserStatus.vue";
import router from "@/router";

interface list {
  user_id: string;
}

const user_list = ref([{} as list]);
const route = useRoute();
const channel_id = route.params.channel_id;
const member_available = ref(false);

// 채널 맴버가 변경됨
UserData.socket.on(`channel/changedChannelMember/${channel_id}`, () => {
  getUsers();
});

async function getUsers() {
  try {
    const res = await UserData.instance.get("/channels/room/users", {
      params: {
        channel_id: `${channel_id}`,
      },
    });
    user_list.value = res.data;
  } catch (err) {
    console.log(err);
  }
}

function userProfile(user_id: string) {
  router.push({
    name: "userinfopage",
    query: { userId: user_id },
  });
}

onMounted(async () => {
  await getUsers();
  member_available.value = true;
});

onUnmounted(() => {
  UserData.socket.removeAllListeners(
    `channel/changedChannelMember/${channel_id}`
  );
});
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  margin: 0;
}
div {
  box-sizing: border-box;
}
</style>
