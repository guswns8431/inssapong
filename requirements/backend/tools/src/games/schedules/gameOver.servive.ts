import { GAME_OBJECT, GameRoomComponent } from '../game.component';
import { GameGateway } from '../games.gateway';
import failSaveResult from './failSaveResult.service';

export default async function gameOver(
  gameRoom: GameRoomComponent,
  gameGateway: GameGateway,
) {
  const p1_id: string = gameRoom.p1_id;
  const p2_id: string = gameRoom.p2_id;
  gameGateway.gameRooms = gameGateway.gameRooms.filter(
    (element) => element.room_id != gameRoom.room_id,
  );
  const p1 = gameGateway.mainGateway.users.find((user) => user.id == p1_id);
  if (p1 != undefined) {
    p1.gameInfo.reset();
    p1.socket.leave(gameRoom.room_id);
    p1.setStatusOnline();
    gameGateway.mainGateway.server.emit(`getUserStatus_${p1.id}`, p1.status);
  }
  const p2 = gameGateway.mainGateway.users.find((user) => user.id == p2_id);
  if (p2 != undefined) {
    p2.gameInfo.reset();
    p2.socket.leave(gameRoom.room_id);
    p2.setStatusOnline();
    gameGateway.mainGateway.server.emit(`getUserStatus_${p2.id}`, p2.status);
  }

  let winner_id;
  let loser_id;
  if (gameRoom.p1_score == GAME_OBJECT.FINAL_SCORE) {
    winner_id = gameRoom.p1_id;
    loser_id = gameRoom.p2_id;
  } else {
    winner_id = gameRoom.p2_id;
    loser_id = gameRoom.p1_id;
  }
  const status_code = await gameGateway.gamesRepository.insertGameHistory(
    winner_id,
    loser_id,
  );
  if (status_code == 500) {
    failSaveResult(gameRoom, gameGateway);
  }
}
