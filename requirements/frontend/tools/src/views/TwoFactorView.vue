<template>
  <div>
    <b-form @submit="onSubmit">
      <b-form-group
        id="input-group-2"
        label="인증번호 입력:"
        label-for="input-1"
      >
        <b-form-input
          id="input-2"
          v-model="OauthNum"
          placeholder="Enter Oauth Num"
          required
        ></b-form-input>
      </b-form-group>
      <b-button type="submit" variant="primary">Submit</b-button>
    </b-form>
  </div>
</template>

<script setup lang="ts">
import { UserData } from "@/store/UserData";
import { inject, ref } from "vue";
import router from "@/router";

const OauthNum = ref();
const inject_setCheckLoginAvailable: () => void = inject(
  "setCheckLoginAvailable"
);

async function sendTwoFactor() {
  try {
    await UserData.instance.put(
      `/login/twofactor`,
      {
        CertificationNumber: OauthNum.value,
      },
      {
        withCredentials: true,
      }
    );
    alert("성공적으로 로그인하셨습니다");
    inject_setCheckLoginAvailable();
    router.push({ name: "home" });
  } catch (err) {
    alert("2차인증에 실패하셨습니다");
    console.log("Error : TwoFactorView.vue sendTwoFactor() 오류 " + err);
  }
}

const onSubmit = (event: Event) => {
  event.preventDefault();
  sendTwoFactor();
};
</script>

<style scoped></style>
