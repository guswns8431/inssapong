<template>
  <div>
    <CreateNewChannel
      v-if="btn_open"
      :btn="btn_open"
      @closeModal="closeModal"
    ></CreateNewChannel>
    <h1>채팅 홈</h1>
    <NavBar></NavBar>
    <div class="chatView">
      <b-card class="left_block" title="참여할 수 있는 채널">
        <div v-if="list_available" class="enterChannel">
          <div :value="idx.id" :key="idx.id" v-for="idx in channel_list">
            <EnterChannel
              :chn_id="idx.id"
              :chn_name="idx.name"
              :has_pwd="idx.has_password"
              :is_parti="false"
              @getList="getList"
            ></EnterChannel>
          </div>
        </div>
      </b-card>
      <b-card class="right_block" title="참여 중인 채널">
        <div v-if="list_available" class="partiChannel">
          <div :value="idx.id" :key="idx.id" v-for="idx in joined_list">
            <EnterChannel
              :chn_id="idx.id"
              :chn_name="idx.name"
              :is_parti="true"
              @getList="getList"
            ></EnterChannel>
          </div>
        </div>
        <BButton
          class="newChannelBtn"
          variant="outline-dark"
          type="button"
          size="lg"
          @click="openModal"
          style="margin-top: 0.2em"
        >
          새로운 채널 만들기 버튼
        </BButton>
      </b-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { BCard, BButton } from "bootstrap-vue-3";
import { UserData } from "@/store/UserData";
import CreateNewChannel from "@/components/channel/CreateNewChannel.vue";
import NavBar from "@/components/mypage/NavBar.vue";
import EnterChannel from "@/components/channel/EnterChannel.vue";

//리스트들 인터페이스로 빼기
interface list {
  id: number;
  name: string;
  has_password: boolean;
}
const btn_open = ref(false);

const channel_list = ref([{} as list]);
const joined_list = ref([{} as list]);

const list_available = ref(false);

// 채널 리스트 변경
UserData.socket.on("channel/changedChannelList", () => {
  getChannelList();
  getJoinedChannel();
});

function openModal() {
  btn_open.value = true;
}

function closeModal() {
  btn_open.value = false;
}

async function getChannelList() {
  try {
    const res = await UserData.instance.get("/channels/list");
    channel_list.value = res.data;
  } catch (err) {
    console.log(err);
  }
}

async function getJoinedChannel() {
  try {
    const res = await UserData.instance.get("/channels/list/join");
    joined_list.value = res.data;
  } catch (err) {
    console.log(err);
  }
}

async function getList() {
  await getChannelList();
  await getJoinedChannel();
}

onMounted(async () => {
  await getList();
  list_available.value = true;
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

.chatView {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-direction: row;
}
.left_block {
  width: 60%;
  height: 30em;
  margin-right: 5px;
  overflow: auto;
  background-color: rgb(245, 245, 245);
}

.left_block::-webkit-scrollbar {
  display: none;
}
.right_block {
  width: 25%;
  height: 100%;
  margin-left: 5px;
  overflow: auto;
  background-color: rgb(245, 245, 245);
}
.right_block::-webkit-scrollbar {
  display: none;
}

.newChannelBtn {
  width: 100%;
}

.channel_list {
  background-color: white;
  margin: 10px 15px 10px 15px;
}

.parti_channel {
  margin: 10px 15px 10px 15px;
}
</style>
