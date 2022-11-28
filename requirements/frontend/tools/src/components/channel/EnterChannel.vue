<template>
  <div>
    <b-card class="channel_list" :title="`${props.chn_name}`">
      <span v-if="props.has_pwd == true && props.is_parti == false">
        🔒
        <input placeholder="비밀번호 입력" type="password" v-model="chn_pw"
      /></span>
      <BButton
        variant="outline-success"
        @click="enterChannel(`${props.chn_id}`)"
        >채널 입장</BButton
      >
    </b-card>
  </div>
</template>
<script setup lang="ts">
import { UserData } from "@/store/UserData";
import { useRouter } from "vue-router";
import { ref } from "vue";

const router = useRouter();
const props = defineProps({
  chn_name: String,
  chn_id: Number,
  has_pwd: Boolean,
  is_parti: Boolean,
});
const emit = defineEmits(["getList"]);
const chn_pw = ref("");

function enter(chn_id: string) {
  router.push(`/channel/${chn_id}`);
}

function enterChannel(chn_id: string) {
  if (props.is_parti == true) {
    enter(chn_id);
  } else {
    const data = new FormData();
    data.append("password", chn_pw.value);
    UserData.instance
      .post("/channels/enter", data, {
        params: { channel_id: chn_id },
        headers: { "Content-Type": "application/json" },
      })
      .then(() => {
        enter(chn_id);
      })
      .catch((err) => {
        if (err.status == 404) alert("채널이 존재하지 않습니다");
        else alert("비밀번호가 틀렸습니다!");
        chn_pw.value = "";
        emit("getList");
      });
  }
}
</script>
<style scoped></style>
