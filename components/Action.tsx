import db from "../firebase/firebase.config";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "store";
import styles from "../src/styles/Game.module.css";
import { Cards, Game } from "interface";

function getUpdatedGame(game: Game, chosenPlayer: string) {
  const copiedGame: Game = JSON.parse(JSON.stringify(game));
  const card = copiedGame.players[chosenPlayer].hands.shift();
  const numberOfPlayers = Object.keys(copiedGame.players).length;
  copiedGame.currentRound.currentTurnPlayerId = chosenPlayer;
  copiedGame.currentRound.openedCards += 1;
  if (!card) throw new Error("Nominating player without cards");
  switch (card) {
    case Cards.EMPTY:
      copiedGame.revealedCards.empty += 1;
      if (
        copiedGame.currentRound.roundNumber === 4 &&
        copiedGame.currentRound.openedCards >= numberOfPlayers
      )
        copiedGame.gameEndingDescription = "시간 초과로 인한 스켈레톤의 승리";
      break;
    case Cards.TREASURE:
      copiedGame.revealedCards.treasure += 1;
      if (game.revealedCards.treasure >= numberOfPlayers)
        copiedGame.gameEndingDescription =
          "모든 보물상자 발견으로 인한 해적의 승리";
      break;
    default:
      copiedGame.gameEndingDescription = "크라켄 조우로 인한 스켈레톤의 승리";
  }
  return copiedGame;
}

async function flipCard(roomCode: string, game: Game, chosenPlayer: string) {
  await updateDoc(doc(db, "games", roomCode), {
    ...getUpdatedGame(game, chosenPlayer),
  });
}

export default function Action({ roomCode }: { roomCode: string }) {
  const [chosenPlayer, setChosenPlayer] = useState("");
  const { game } = useSelector((state: RootState) => state);
  const { players, currentRound } = game;
  const { userId } = useSelector((state: RootState) => state.user);
  return (
    <>
      <h1>현재 당신의 차례입니다.</h1>
      <p>카드를 오픈하고 싶은 플레이어를 선택하십시오.</p>
      <table>
        {Object.values(players)
          .filter((player) => player.userId !== userId && player.hands.length)
          .map((player) => (
            <tr key={player.userId}>
              <td
                className={chosenPlayer === player.userId ? styles.red : ""}
                onClick={(e) => {
                  setChosenPlayer(player.userId);
                }}
              >
                {player.nickname}
              </td>
            </tr>
          ))}
      </table>
      <button
        onClick={() => {
          flipCard(roomCode, game, chosenPlayer);
        }}
        className="btn btn-primary"
        disabled={
          !chosenPlayer ||
          currentRound.openedCards >= Object.keys(players).length
        }
      >
        확정
      </button>
    </>
  );
}
