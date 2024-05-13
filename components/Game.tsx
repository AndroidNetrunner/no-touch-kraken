import db from "../firebase/firebase.config";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "store";
import {
  setCurrentRound,
  setDescription,
  setPlayers,
} from "store/slices/gameSlice";
import Round from "./Round";
import Result from "./Result";
import Cookies from "js-cookie";
import styles from "../src/styles/Game.module.css";
import Role from "./Role";
import RevealedCards from "./RevealedCards";
import { onValue, ref } from "firebase/database";

export default function Game() {
  const {
    user: { userId: myPlayerId, nickname },
    game: {
      players,
      gameEndingDescription,
      revealedCards,
      currentRound: { roundNumber },
    },
    room: { roomCode },
  } = useSelector((state: RootState) => state);
  const myPlayer = players[myPlayerId];
  const dispatch = useDispatch();
  useEffect(() => {
    const unSubscribe = onValue(
      ref(db, "games/" + roomCode),
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          dispatch(setPlayers(data.players));
          if (data.gameEndingDescription) {
            dispatch(setDescription(data.gameEndingDescription));
          }
        }
      },
      (error) => {
        console.log("Snapshot listener disconnected: ", error);
      }
    );
    if (myPlayerId) Cookies.set("userId", myPlayerId);
    if (myPlayer) Cookies.set("nickname", nickname);
    if (roomCode) Cookies.set("roomCode", roomCode);

    return unSubscribe;
  }, [dispatch, myPlayerId, nickname, roomCode, roundNumber, myPlayer]);
  return (
    <>
      <div className={"container" + " " + styles.main}>
        {gameEndingDescription ? (
          <Result
            players={players}
            description={gameEndingDescription}
            roomCode={roomCode}
          />
        ) : (
          <>
            <Role role={myPlayer?.role} />
            <RevealedCards revealedCards={revealedCards} />
            <Round
              playerNumber={Object.keys(players).length as 4 | 5 | 6}
              roomCode={roomCode}
            />
          </>
        )}
      </div>
    </>
  );
}
