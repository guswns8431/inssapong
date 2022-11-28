<template>
  <div class="black-bg">
    <div class="white-bg">
      <div class="closeModal" @click="emit('closeModal')">❌</div>
      <h4>새로운 채널 만들기</h4>
      <form ref="form" @submit.stop.prevent="formSubmit">
        <b-form-group>
          <b-form-input
            maxlength="20"
            label="채널 이름"
            id="inputId"
            v-model="chn_name"
            @blur="checkTitle"
            placeholder="채널명(20자제한)"
          ></b-form-input>
          <b-form-input
            label="채널 비밀번호"
            maxlength="4"
            id="inputPwd"
            v-model="chn_pwd"
            @blur="checkPwd"
            type="password"
            placeholder="비밀번호를 입력하지 않으면 공개채널이 생성됩니다.(숫자4자리)"
          ></b-form-input>
        </b-form-group>
        <BButton variant="outline-primary" type="submit">채널 생성하기</BButton>
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { UserData } from "@/store/UserData";
import { ref } from "vue";
import { useRouter } from "vue-router";

const emit = defineEmits(["closeModal"]);
const router = useRouter();
const chn_name = ref("");
const chn_pwd = ref("");

function checkTitle() {
  if (chn_name.value.length > 20) {
    chn_name.value = chn_name.value.slice(0, 20);
  }
}

function checkPwd() {
  if (chn_pwd.value.length > 4) {
    chn_pwd.value = chn_pwd.value.slice(0, 4);
  }
}

function enter(chn_id: string) {
  router.push(`/channel/${chn_id}`);
}

function formSubmit() {
  if (chn_pwd.value != "" && chn_pwd.value.match(/^[0-9]+$/) == null) {
    alert("비밀번호는 숫자만 가능합니다!");
    chn_pwd.value = "";
    return;
  }
  const data = new FormData();
  data.append("name", `${chn_name.value}`);
  data.append("password", `${chn_pwd.value}`);
  const res = UserData.instance.post("/channels/create", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  res
    .then((res: { data: { id: string } }) => {
      enter(res.data.id);
    })
    .catch((err: object) => {
      console.log(err);
      alert("채팅방 생성 실패");
    });
}
</script>

<style scoped>
.black-bg {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  z-index: 10;
}

.white-bg {
  width: 40%;
  height: 20em;
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin: 10em;
  display: grid;
  z-index: 100;
}

.closeModal {
  display: flex;
  justify-content: flex-end;
}
</style>
