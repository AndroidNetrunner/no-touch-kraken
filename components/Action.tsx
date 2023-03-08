import db from "../firebase/firebase.config";
import { deleteDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "store";
import styles from "../src/styles/Game.module.css";
import { card, Cards, Player } from "interface";

async function flipCard(
  roomCode: string,
  game: {
    players: { [userId: string]: Player };
    revealedCards: {
      empty: number;
      treasure: number;
    };
    currentRound: {
      openedCards: number;
      currentTurnPlayerId: string;
      roundNumber: 1 | 2 | 3 | 4;
    };
  },
  chosenPlayer: string
) {
  const { players, revealedCards, currentRound } = game;
  const docRef = doc(db, "games", roomCode);
  const player = players[chosenPlayer];
  const newHands = [...(player?.hands as card[])];
  const card = newHands.shift();
  console.log(`revealedCards:`, revealedCards);
  if (card === Cards.KRAKEN)
    await updateDoc(docRef, {
      description: "크라켄 조우로 인한 스켈레톤의 승리",
    });
  else if (
    revealedCards.treasure + 1 === Object.keys(players).length &&
    card === Cards.TREASURE
  )
    await updateDoc(docRef, {
      description: "모든 보물상자 발견으로 인한 해적의 승리",
    });
  else if (
    currentRound.roundNumber === 4 &&
    currentRound.openedCards + 1 === Object.keys(players).length
  )
    await updateDoc(docRef, {
      description: "시간 초과로 인한 스켈레톤의 승리",
    });
  else {
    await updateDoc(docRef, {
      players: {
        ...players,
        [chosenPlayer]: {
          ...player,
          hands: newHands,
        },
      },
      revealedCards: {
        empty:
          card === Cards.EMPTY ? revealedCards.empty + 1 : revealedCards.empty,
        treasure:
          card === Cards.TREASURE
            ? revealedCards.treasure + 1
            : revealedCards.treasure,
      },
      currentRound: {
        ...currentRound,
        openedCards: currentRound.openedCards + 1,
        currentTurnPlayerId: chosenPlayer,
      },
    });
  }
}

export default function Action({ roomCode }: { roomCode: string }) {
  const [chosenPlayer, setChosenPlayer] = useState("");
  const { players, revealedCards, currentRound } = useSelector(
    (state: RootState) => state.game
  );
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
          flipCard(
            roomCode,
            { players, revealedCards, currentRound },
            chosenPlayer
          );
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
