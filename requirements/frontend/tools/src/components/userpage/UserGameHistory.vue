<template>
  <div>
    <b-card title="게임 전적" class="history">
      <b-card-body class="history_body">
        <b-list-group
          :key="game.id"
          v-for="game in game_history"
          style="width: 70%"
        >
          <b-list-group-item
            class="history_list"
            variant="success"
            v-if="game.winner == user_id"
            >{{ game.winner }} 승 <br />
            {{ game.loser }} 패</b-list-group-item
          >
          <b-list-group-item class="history_list" variant="danger" v-else
            >{{ game.winner }} 승<br />
            {{ game.loser }} 패</b-list-group-item
          >
        </b-list-group>
      </b-card-body>
    </b-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { UserData } from "@/store/UserData";
import { useRoute } from "vue-router";
import router from "@/router";

interface history {
  id: number;
  winner: string;
  loser: string;
}

const game_history = ref([{} as history]);
const route = useRoute();
const user_id = route.query.userId;

function getGameHistory() {
  UserData.instance
    .get(`/users/gameHistory?id=${user_id}`)
    .then((res) => {
      game_history.value = res.data.gameHistory;
    })
    .catch((err) => {
      router.back();
      console.log("Error : MypageView.vue : getGameHistory() 함수 오류 " + err);
    });
}

onMounted(() => {
  getGameHistory();
});
</script>

<style scoped>
.history {
  margin: 10px 5px;
}
.history_body {
  display: inline-flex;
}

.history_list {
  width: 10em;
  font-weight: bolder;
}
</style>
