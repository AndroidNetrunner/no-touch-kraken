import db from "../firebase/firebase.config";
import { doc, onSnapshot } from "firebase/firestore";
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
import { Roles } from "@/roles";

export default function Game() {
  const myPlayerId = useSelector((state: RootState) => state.user.userId);
  const description = useSelector((state: RootState) => state.game.description);
  const { players } = useSelector((state: RootState) => state.game);
  const { roomCode } = useSelector((state: RootState) => state.room);
  const myPlayer = players[myPlayerId];
  const { treasure, empty } = useSelector(
    (state: RootState) => state.game.revealedCards
  );
  const { roundNumber } = useSelector(
    (state: RootState) => state.game.currentRound
  );
  const dispatch = useDispatch();
  const docRef = doc(db, "games", roomCode);
  useEffect(() => {
    const unsubGame = onSnapshot(docRef, (doc) => {
      const data = doc.data();
      if (data) {
        dispatch(setPlayers(data.players));
        if (data.description) {
          dispatch(setDescription(data.description));
        }
        if (data.currentRound.roundNumber !== roundNumber)
          dispatch(setCurrentRound(data.currentRound));
      }
    });
    if (myPlayerId) Cookies.set("userId", myPlayerId);
    if (myPlayer) Cookies.set("nickname", myPlayer.nickname);
    if (roomCode) Cookies.set("roomCode", roomCode);
  }, []);
  return (
    <>
      <div className={"container" + " " + styles.main}>
        {description ? (
          <Result
            players={players}
            description={description}
            roomCode={roomCode}
          />
        ) : (
          <>
            <h1>
              당신의 역할은{" "}
              <span
                className={
                  myPlayer?.role === Roles.PIRATE
                    ? styles.pirate
                    : styles.skeleton
                }
              >
                {myPlayer?.role}
              </span>
              입니다.
            </h1>
            <span className={styles.description}>
              {"승리 조건: " +
                (myPlayer?.role === Roles.PIRATE
                  ? "4라운드 안에 크라켄을 만나지 않고 4개의 보물상자를 모두 찾기"
                  : "4라운드동안 4개의 보물상자를 못 찾거나, 크라켄을 조우하기")}
            </span>
            <h1>현재 등장한 카드</h1>
            보물상자: {treasure} 빈 상자: {empty}
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
