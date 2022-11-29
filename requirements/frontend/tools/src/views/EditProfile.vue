<template>
  <div>
    <b-card>
      <div>
        <b-form @submit="onSubmit">
          <b-form-group
            id="input-group-2"
            label="닉네임 입력(글자수 제한 : 10자):"
            label-for="input-1"
          >
            <b-form-input
              id="input-2"
              @blur="checkNickname"
              v-model="new_nickname"
              required
              maxlength="10"
            ></b-form-input>
          </b-form-group>
          <b-form-group
            id="input-group-2"
            label="Your Image:"
            label-for="input-2"
          >
            <input
              accept="image/*"
              type="file"
              @change="uploadImg"
              id="input"
            />
          </b-form-group>
          <b-button v-if="validation == 'TRUE'" type="submit" variant="primary"
            >Submit</b-button
          >
          <b-button
            v-else-if="validation == 'FALSE'"
            disabled
            type="submit"
            variant="primary"
            >Submit</b-button
          >
        </b-form>
      </div>
      <img :src="`${image}`" />
    </b-card>
    <div v-if="is_loading">업로드중..</div>
  </div>
</template>

<script setup lang="ts">
import { UserData } from "@/store/UserData";
import { onMounted, ref, inject } from "vue";
import router from "@/router";

const image = ref("");
const old_image = ref("");
const validation = ref("TRUE");
const is_loading = ref<boolean>(false);
const new_nickname = ref();
const error_flag = ref<boolean>(false);
const MAX_IMG_SIZE = 1024 * 1024;
const inject_setCheckLoginAvailable: () => void = inject(
  "setCheckLoginAvailable"
);

const onSubmit = (event: Event) => {
  event.preventDefault();
  is_loading.value = true;
  sendNewInfo();
};

function checkNickname() {
  if (new_nickname.value.length > 10) {
    new_nickname.value = new_nickname.value.slice(0, 10);
  }
}

function getMyInfo() {
  if (window.location.pathname == "/editprofile") {
    UserData.instance
      .get("/mypage")
      .then((res) => {
        new_nickname.value = res.data.nickname;
        image.value = res.data.avatar;
        old_image.value = res.data.avatar;
      })
      .catch((err) => {
        console.log("Error : EditProfile.vue : getMyInfo()" + err);
      });
  } else if (window.location.pathname == "/signup") {
    new_nickname.value = UserData.user_id;
  }
}

function uploadImg(event: Event) {
  const max_size = MAX_IMG_SIZE;
  const files = (event.target as HTMLInputElement).files;
  if (files && files.length) {
    if (files[0].size > max_size) {
      alert("프로필 사진의 파일 크기는 1MB 이내만 가능합니다");
      validation.value = "FALSE";
      image.value = old_image.value;
      return;
    }
    validation.value = "TRUE";
    const file = files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (reader.result) {
        image.value = reader.result;
      }
    };
  }
}

function sendNewInfo() {
  const data = new FormData();
  const byteImage = image.value;

  const headers = {
    "Content-type": "application/json",
    Accept: "*/*",
  };

  UserData.instance.defaults.headers.patch = null;
  UserData.instance.defaults.headers.post = null;

  data.append("avatar", byteImage);
  data.append("nickname", new_nickname.value);
  if (window.location.pathname == "/editprofile") {
    UserData.instance
      .patch("/mypage", data, {
        headers,
      })
      .then(() => {
        if (!error_flag.value) {
          alert("완료되었습니다");
          router.push({ name: "mypage" });
        }
      })
      .catch((err) => {
        if (err.response.status == 409) {
          alert("닉네임이 중복됩니다");
          router.go(0);
        }
        console.log("Error : EditProfile.vue : sendNewInfo() 오류 : " + err);
      });
  } else if (window.location.pathname == "/signup") {
    UserData.instance
      .post("/login/signup", data, { headers: headers, withCredentials: true })
      .then(() => {
        inject_setCheckLoginAvailable();
        router.push({ name: "home" });
      })
      .catch((err) => {
        if (err.response.status == 409) {
          alert("닉네임이 중복됩니다");
          router.go(0);
        }
        console.log(
          "Error : EditProfile.vue : else if sendNewInfo() 오류 : " + err
        );
      });
  }
}
onMounted(() => {
  getMyInfo();
});
</script>

<style scoped>
img {
  height: 400px;
  width: 400px;
}
</style>
